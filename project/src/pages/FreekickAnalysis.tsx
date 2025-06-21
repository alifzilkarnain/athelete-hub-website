import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, Play, Square, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { videoAnalysisService, AnalysisProgress } from '../services/videoAnalysis';

const FreekickAnalysis: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const navigate = useNavigate();

  // Check camera availability on component mount
  useEffect(() => {
    checkCameraAvailability();
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setCameraError('No camera found on this device');
        return;
      }

      // Test camera access with basic constraints
      const testStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      testStream.getTracks().forEach(track => track.stop());
      setCameraReady(true);
      setCameraError(null);
    } catch (error) {
      console.error('Camera check failed:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setCameraError('Camera access denied. Please allow camera permissions and refresh the page.');
        } else if (error.name === 'NotFoundError') {
          setCameraError('No camera found on this device');
        } else if (error.name === 'NotSupportedError') {
          setCameraError('Camera not supported on this device');
        } else {
          setCameraError('Unable to access camera. Please check your device settings.');
        }
      } else {
        setCameraError('Unknown camera error occurred');
      }
    }
  };

  const startRecording = async () => {
    try {
      setCameraError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
      }

      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('video/webm')) {
        throw new Error('Video recording not supported on this browser');
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        recordedBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
          videoRef.current.load();
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setCameraError('Recording failed. Please try again.');
      };

      mediaRecorder.start(1000); // Record in 1-second chunks
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setCameraError('Camera access denied. Please allow camera permissions and try again.');
        } else if (error.name === 'NotFoundError') {
          setCameraError('No camera found. Please connect a camera and try again.');
        } else if (error.name === 'NotReadableError') {
          setCameraError('Camera is being used by another application.');
        } else {
          setCameraError(`Recording error: ${error.message}`);
        }
      } else {
        setCameraError('Failed to start recording. Please try again.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const resetRecording = () => {
    setRecordedVideo(null);
    setUploadedFile(null);
    setCameraError(null);
    setAnalysisProgress(null);
    recordedBlobRef.current = null;
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setRecordedVideo(url);
      setCameraError(null);
      setAnalysisProgress(null);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.srcObject = null;
        videoRef.current.load();
      }
    } else {
      setCameraError('Please select a valid video file');
    }
  };

  const analyzeVideo = async () => {
    const videoToAnalyze = uploadedFile || recordedBlobRef.current;
    if (!videoToAnalyze) return;
    
    setAnalyzing(true);
    setAnalysisProgress({ stage: 'starting', progress: 0, message: 'Preparing analysis...' });
    
    try {
      const result = await videoAnalysisService.uploadAndAnalyze(
        videoToAnalyze,
        (progress) => setAnalysisProgress(progress)
      );

      // Save the result
      await videoAnalysisService.saveAnalysisResult(result);

      // Navigate to results page
      navigate(`/results/${result.sessionId}`);
    } catch (error) {
      console.error('Analysis failed:', error);
      setCameraError('Analysis failed. Please try again.');
      setAnalyzing(false);
      setAnalysisProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Free Kick Analysis</h1>
        <div className="w-6"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Record Your Free Kick</h2>
            <p className="text-gray-400">Position your camera to capture the entire ball trajectory</p>
          </div>

          {/* Camera Error Display */}
          {cameraError && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{cameraError}</p>
                {cameraError.includes('permissions') && (
                  <button 
                    onClick={checkCameraAvailability}
                    className="text-red-200 underline text-sm mt-1 hover:text-red-100"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Video Preview */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                controls={recordedVideo ? true : false}
              />
              {!recordedVideo && !isRecording && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Camera className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p>Camera preview will appear here</p>
                    <p className="text-sm mt-2">Click "Start Recording" to begin</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="flex justify-center space-x-4">
              {!isRecording && !recordedVideo && !analyzing && (
                <>
                  <button
                    onClick={startRecording}
                    disabled={!cameraReady || !!cameraError}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-colors"
                  >
                    <Camera className="h-5 w-5" />
                    <span>{cameraReady ? 'Start Recording' : 'Camera Not Ready'}</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                    <span>Upload Video</span>
                  </button>
                </>
              )}

              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full flex items-center space-x-2 animate-pulse"
                >
                  <Square className="h-5 w-5" />
                  <span>Stop Recording</span>
                </button>
              )}

              {recordedVideo && !analyzing && (
                <div className="flex space-x-4">
                  <button
                    onClick={resetRecording}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-colors"
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span>Retake</span>
                  </button>
                  <button
                    onClick={analyzeVideo}
                    className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-8 py-3 rounded-full flex items-center space-x-2 transition-colors"
                  >
                    <Play className="h-5 w-5" />
                    <span>Analyze Video</span>
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Analysis Progress */}
          {analyzing && analysisProgress && (
            <div className="bg-gray-800 rounded-2xl p-6 text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                {analysisProgress.stage === 'complete' ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {analysisProgress.stage === 'complete' ? 'Analysis Complete!' : 'Processing Your Video'}
              </h3>
              <p className="text-gray-400 mb-4">{analysisProgress.message}</p>
              <div className="bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${analysisProgress.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{analysisProgress.progress}% complete</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-yellow-500">Recording Tips</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Position camera to capture the entire ball path from kick to goal</li>
              <li>• Ensure good lighting for better ball detection</li>
              <li>• Keep the camera steady during recording</li>
              <li>• Record in landscape mode for best results</li>
              <li>• Make sure the ball is clearly visible against the background</li>
              <li>• Record the complete kick motion including follow-through</li>
            </ul>
          </div>

          {/* Processing Info */}
          <div className="mt-6 bg-blue-500 bg-opacity-20 border border-blue-500 rounded-2xl p-4">
            <h4 className="font-semibold text-blue-300 mb-2">How It Works</h4>
            <p className="text-blue-200 text-sm">
              Our AI uses YOLO (You Only Look Once) computer vision to detect and track the ball throughout your video. 
              We calculate trajectory, speed, and provide detailed analysis of your free kick technique.
            </p>
          </div>

          {/* Browser Compatibility Note */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Camera recording works best in Chrome, Firefox, and Safari browsers.</p>
            <p>If you're having issues, try uploading a video file instead.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreekickAnalysis;
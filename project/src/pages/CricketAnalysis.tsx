import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, Play, Square, RotateCcw, AlertCircle, CheckCircle, Trophy } from 'lucide-react';
import { cricketAnalysisService, CricketAnalysisProgress } from '../services/cricketAnalysis';

const CricketAnalysis: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<CricketAnalysisProgress | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [analysisType, setAnalysisType] = useState<'bowling' | 'batting'>('bowling');
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
    setAnalysisProgress({ stage: 'starting', progress: 0, message: 'Preparing cricket analysis...' });
    
    try {
      const result = await cricketAnalysisService.uploadAndAnalyze(
        videoToAnalyze,
        analysisType,
        (progress) => setAnalysisProgress(progress)
      );

      // Save the result
      await cricketAnalysisService.saveAnalysisResult(result);

      // Navigate to results page
      navigate(`/cricket-results/${result.sessionId}`);
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
        <h1 className="text-xl font-semibold">Cricket Analysis</h1>
        <div className="w-6"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="bg-green-500 p-3 rounded-full inline-block mb-4">
              <Trophy className="h-8 w-8 text-gray-900" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Cricket Ball Analysis</h2>
            <p className="text-gray-400">Analyze bowling speed, trajectory, and ball movement</p>
          </div>

          {/* Analysis Type Selection */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Analysis Type</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setAnalysisType('bowling')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  analysisType === 'bowling'
                    ? 'border-green-500 bg-green-500 bg-opacity-20 text-green-300'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2" />
                  <h4 className="font-semibold">Bowling Analysis</h4>
                  <p className="text-sm mt-1">Speed, swing, seam movement</p>
                </div>
              </button>
              <button
                onClick={() => setAnalysisType('batting')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  analysisType === 'batting'
                    ? 'border-green-500 bg-green-500 bg-opacity-20 text-green-300'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2" />
                  <h4 className="font-semibold">Batting Analysis</h4>
                  <p className="text-sm mt-1">Shot power, trajectory, timing</p>
                </div>
              </button>
            </div>
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
                    className="bg-green-500 hover:bg-green-600 text-gray-900 font-semibold px-8 py-3 rounded-full flex items-center space-x-2 transition-colors"
                  >
                    <Play className="h-5 w-5" />
                    <span>Analyze Cricket Video</span>
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {analysisProgress.stage === 'complete' ? 'Cricket Analysis Complete!' : 'Processing Your Cricket Video'}
              </h3>
              <p className="text-gray-400 mb-4">{analysisProgress.message}</p>
              <div className="bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${analysisProgress.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{analysisProgress.progress}% complete</p>
            </div>
          )}

          {/* Cricket-specific Instructions */}
          <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-green-500">Cricket Recording Tips</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-400 mb-2">For Bowling Analysis:</h4>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>• Position camera side-on to capture full bowling action</li>
                  <li>• Include the complete delivery stride and follow-through</li>
                  <li>• Ensure ball is visible from release to pitch</li>
                  <li>• Record at least 3-4 deliveries for better analysis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-2">For Batting Analysis:</h4>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>• Capture the complete batting stroke</li>
                  <li>• Include ball contact and follow-through</li>
                  <li>• Position camera to show ball trajectory after contact</li>
                  <li>• Ensure good lighting for ball tracking</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Processing Info */}
          <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-2xl p-4">
            <h4 className="font-semibold text-green-300 mb-2">Cricket AI Analysis</h4>
            <p className="text-green-200 text-sm">
              Our specialized cricket AI analyzes ball speed, swing movement, seam position, bounce patterns, 
              and trajectory using advanced computer vision. Perfect for bowlers and batsmen looking to improve their technique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CricketAnalysis;
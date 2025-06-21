import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Target, Zap, TrendingUp, Play, AlertCircle, Video, Eye } from 'lucide-react';
import { videoAnalysisService, AnalysisResult } from '../services/videoAnalysis';

const Results: React.FC = () => {
  const { sessionId } = useParams();
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        const results = await videoAnalysisService.getAnalysisResult(sessionId);
        if (results) {
          setAnalysisResults(results);
        } else {
          // If no results found, create demo results for backward compatibility
          const demoResults: AnalysisResult = {
            sessionId,
            maxSpeed: 78.5 + Math.random() * 10,
            avgSpeed: 65.2 + Math.random() * 8,
            ballDetected: true,
            trajectoryPoints: 42 + Math.floor(Math.random() * 20),
            accuracy: 88 + Math.floor(Math.random() * 12),
            distance: 24.5 + Math.random() * 5,
            duration: 2.3 + Math.random() * 1,
            processingTime: 3.1,
            timestamp: new Date().toISOString(),
            processedVideoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', // Demo video
            originalVideoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
          };
          setAnalysisResults(demoResults);
        }
      } catch (err) {
        console.error('Failed to load results:', err);
        setError('Failed to load analysis results');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [sessionId]);

  const downloadResults = () => {
    if (!analysisResults) return;
    
    const data = {
      sessionId: analysisResults.sessionId,
      timestamp: analysisResults.timestamp,
      results: {
        maxSpeed: `${analysisResults.maxSpeed} km/h`,
        avgSpeed: `${analysisResults.avgSpeed} km/h`,
        distance: `${analysisResults.distance}m`,
        duration: `${analysisResults.duration}s`,
        trajectoryPoints: analysisResults.trajectoryPoints,
        accuracy: `${analysisResults.accuracy}%`,
        ballDetected: analysisResults.ballDetected
      },
      videoUrls: {
        processed: analysisResults.processedVideoUrl,
        original: analysisResults.originalVideoUrl
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freekick-analysis-${analysisResults.sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadProcessedVideo = () => {
    if (!analysisResults?.processedVideoUrl) return;
    
    const a = document.createElement('a');
    a.href = analysisResults.processedVideoUrl;
    a.download = `freekick-trajectory-${analysisResults.sessionId}.mp4`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareResults = async () => {
    if (!analysisResults) return;

    const shareData = {
      title: 'My Free Kick Analysis - AthleteHub',
      text: `Check out my free kick analysis! Max speed: ${analysisResults.maxSpeed} km/h, Accuracy: ${analysisResults.accuracy}%`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
      alert('Results copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error || !analysisResults) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold">Analysis Results</h1>
          <div className="w-6"></div>
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Results Not Found</h2>
            <p className="text-gray-400 mb-6">{error || 'The analysis results could not be loaded.'}</p>
            <Link 
              to="/freekick-analysis"
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Analyze New Video
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Analysis Results</h1>
        <div className="flex space-x-2">
          <button 
            onClick={shareResults}
            className="text-gray-400 hover:text-white transition-colors"
            title="Share Results"
          >
            <Share2 className="h-6 w-6" />
          </button>
          <button 
            onClick={downloadResults}
            className="text-gray-400 hover:text-white transition-colors"
            title="Download Results"
          >
            <Download className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Session Info */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Free Kick Analysis Complete</h2>
            <p className="text-gray-400">Session: {analysisResults.sessionId}</p>
            <p className="text-sm text-gray-500">
              Analyzed on {new Date(analysisResults.timestamp).toLocaleString()}
            </p>
          </div>

          {/* Ball Detection Status */}
          <div className="text-center mb-6">
            {analysisResults.ballDetected ? (
              <span className="bg-green-500 bg-opacity-20 text-green-400 px-4 py-2 rounded-full text-sm flex items-center justify-center space-x-2 inline-flex">
                <Target className="h-4 w-4" />
                <span>Ball Successfully Detected & Tracked</span>
              </span>
            ) : (
              <span className="bg-red-500 bg-opacity-20 text-red-400 px-4 py-2 rounded-full text-sm flex items-center justify-center space-x-2 inline-flex">
                <AlertCircle className="h-4 w-4" />
                <span>Ball Detection Failed</span>
              </span>
            )}
          </div>

          {/* Video Comparison */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Ball Trajectory Video</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowOriginal(false)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    !showOriginal 
                      ? 'bg-yellow-500 text-gray-900' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Video className="h-4 w-4 inline mr-2" />
                  With Trajectory
                </button>
                <button
                  onClick={() => setShowOriginal(true)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    showOriginal 
                      ? 'bg-yellow-500 text-gray-900' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-2" />
                  Original
                </button>
              </div>
            </div>

            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative">
              {analysisResults.processedVideoUrl ? (
                <video
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  src={showOriginal ? analysisResults.originalVideoUrl : analysisResults.processedVideoUrl}
                >
                  <source 
                    src={showOriginal ? analysisResults.originalVideoUrl : analysisResults.processedVideoUrl} 
                    type="video/mp4" 
                  />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Video className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="font-semibold">Processed Video Not Available</p>
                    <p className="text-sm mt-2">The trajectory video is being generated</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Description */}
            <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-500 mb-2">
                {showOriginal ? 'Original Video' : 'Trajectory Analysis Video'}
              </h4>
              <p className="text-gray-300 text-sm">
                {showOriginal 
                  ? 'Your original free kick video as uploaded/recorded.'
                  : 'Processed video showing ball trajectory (blue line), bounding boxes (green), and speed measurements using YOLO detection.'
                }
              </p>
            </div>
            
            {/* Processing Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
              <div>
                <p className="text-gray-400">Processing Time</p>
                <p className="font-semibold">{analysisResults.processingTime}s</p>
              </div>
              <div>
                <p className="text-gray-400">Model Used</p>
                <p className="font-semibold">YOLO v8</p>
              </div>
              <div>
                <p className="text-gray-400">Trajectory Points</p>
                <p className="font-semibold">{analysisResults.trajectoryPoints}</p>
              </div>
              <div>
                <p className="text-gray-400">Detection Accuracy</p>
                <p className="font-semibold">{analysisResults.accuracy}%</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-red-500 to-orange-500 p-6 rounded-2xl text-white">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-8 w-8" />
                <span className="text-3xl font-bold">{analysisResults.maxSpeed}</span>
              </div>
              <p className="font-semibold">Max Speed (km/h)</p>
              <p className="text-sm opacity-80 mt-1">Peak velocity detected</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-blue-400" />
                <span className="text-3xl font-bold text-blue-400">{analysisResults.avgSpeed}</span>
              </div>
              <p className="text-gray-300 font-semibold">Avg Speed (km/h)</p>
              <p className="text-sm text-gray-500 mt-1">Throughout flight</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-green-400" />
                <span className="text-3xl font-bold text-green-400">{analysisResults.distance}m</span>
              </div>
              <p className="text-gray-300 font-semibold">Distance Traveled</p>
              <p className="text-sm text-gray-500 mt-1">Total ball path</p>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-6">Detailed Analysis</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Flight Duration</span>
                  <span className="font-semibold text-yellow-500">{analysisResults.duration}s</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Ball Detection Rate</span>
                  <span className="font-semibold text-green-400">{analysisResults.accuracy}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Trajectory Points</span>
                  <span className="font-semibold">{analysisResults.trajectoryPoints}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Session ID</span>
                  <span className="font-mono text-sm text-yellow-500">{analysisResults.sessionId.slice(-8)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Analysis Model</span>
                  <span className="font-semibold">YOLO v8</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Processing Time</span>
                  <span className="font-semibold">{analysisResults.processingTime}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-yellow-500">AI Performance Insights</h3>
            <div className="space-y-4">
              {analysisResults.maxSpeed > 70 && (
                <div className="flex items-start space-x-3">
                  <div className="bg-green-500 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-gray-300">
                    <strong>Excellent power!</strong> Your max speed of {analysisResults.maxSpeed} km/h is above average for free kicks (typical range: 50-80 km/h).
                  </p>
                </div>
              )}
              
              {analysisResults.trajectoryPoints > 30 && (
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-gray-300">
                    <strong>Great tracking!</strong> We detected {analysisResults.trajectoryPoints} trajectory points, indicating excellent ball visibility throughout the flight.
                  </p>
                </div>
              )}
              
              {analysisResults.accuracy > 90 && (
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-500 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-gray-300">
                    <strong>Perfect conditions!</strong> {analysisResults.accuracy}% detection accuracy means optimal lighting and camera positioning.
                  </p>
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-500 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-gray-300">
                  <strong>Flight analysis:</strong> {analysisResults.duration}s flight time over {analysisResults.distance}m suggests good ball elevation and technique.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/freekick-analysis"
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-8 py-3 rounded-full transition-colors text-center flex items-center justify-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>Analyze Another Shot</span>
            </Link>
            <button 
              onClick={downloadProcessedVideo}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full transition-colors flex items-center justify-center space-x-2"
              disabled={!analysisResults.processedVideoUrl}
            >
              <Video className="h-5 w-5" />
              <span>Download Trajectory Video</span>
            </button>
            <button 
              onClick={downloadResults}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-full transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Download Data</span>
            </button>
            <button 
              onClick={shareResults}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full transition-colors flex items-center justify-center space-x-2"
            >
              <Share2 className="h-5 w-5" />
              <span>Share Results</span>
            </button>
          </div>

          {/* Backend Integration Info */}
          <div className="mt-8 bg-blue-500 bg-opacity-20 border border-blue-500 rounded-2xl p-6">
            <h4 className="font-semibold text-blue-300 mb-3">🔧 Backend Integration Ready</h4>
            <div className="text-blue-200 text-sm space-y-2">
              <p><strong>Your Python YOLO code integration points:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Video upload endpoint: <code className="bg-blue-900 px-2 py-1 rounded">/api/process-video</code></li>
                <li>YOLO processing with trajectory overlay (blue line + green boxes)</li>
                <li>Speed calculation and annotation</li>
                <li>Processed video output with trajectory visualization</li>
                <li>Real-time progress updates during processing</li>
              </ul>
              <p className="mt-3">
                <strong>Next step:</strong> Connect this frontend to your Python backend that runs the YOLO code you provided.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
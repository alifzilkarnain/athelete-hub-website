import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Trophy, Zap, TrendingUp, Play, AlertCircle, Video, Eye, Target } from 'lucide-react';
import { cricketAnalysisService, CricketAnalysisResult } from '../services/cricketAnalysis';

const CricketResults: React.FC = () => {
  const { sessionId } = useParams();
  const [analysisResults, setAnalysisResults] = useState<CricketAnalysisResult | null>(null);
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
        const results = await cricketAnalysisService.getAnalysisResult(sessionId);
        if (results) {
          setAnalysisResults(results);
        } else {
          // Create demo cricket results
          const demoResults: CricketAnalysisResult = {
            sessionId,
            analysisType: 'bowling',
            maxSpeed: 135 + Math.random() * 15,
            avgSpeed: 125 + Math.random() * 10,
            ballDetected: true,
            trajectoryPoints: 45 + Math.floor(Math.random() * 25),
            accuracy: 92 + Math.floor(Math.random() * 8),
            distance: 20.5 + Math.random() * 2,
            duration: 1.2 + Math.random() * 0.5,
            swingMovement: Math.random() * 12,
            seamPosition: 'upright',
            bounceHeight: 75 + Math.random() * 20,
            pitchLength: 20 + Math.random() * 2,
            releaseHeight: 2.4 + Math.random() * 0.2,
            processingTime: 4.2,
            timestamp: new Date().toISOString(),
            processedVideoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            originalVideoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
          };
          setAnalysisResults(demoResults);
        }
      } catch (err) {
        console.error('Failed to load cricket results:', err);
        setError('Failed to load cricket analysis results');
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
      analysisType: analysisResults.analysisType,
      timestamp: analysisResults.timestamp,
      results: {
        maxSpeed: `${analysisResults.maxSpeed} km/h`,
        avgSpeed: `${analysisResults.avgSpeed} km/h`,
        distance: `${analysisResults.distance}m`,
        duration: `${analysisResults.duration}s`,
        trajectoryPoints: analysisResults.trajectoryPoints,
        accuracy: `${analysisResults.accuracy}%`,
        ballDetected: analysisResults.ballDetected,
        ...(analysisResults.analysisType === 'bowling' && {
          swingMovement: `${analysisResults.swingMovement}°`,
          seamPosition: analysisResults.seamPosition,
          bounceHeight: `${analysisResults.bounceHeight}cm`,
          pitchLength: `${analysisResults.pitchLength}m`,
          releaseHeight: `${analysisResults.releaseHeight}m`
        }),
        ...(analysisResults.analysisType === 'batting' && {
          shotPower: analysisResults.shotPower,
          contactPoint: analysisResults.contactPoint,
          shotType: analysisResults.shotType
        })
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cricket-analysis-${analysisResults.sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareResults = async () => {
    if (!analysisResults) return;

    const shareData = {
      title: `My Cricket ${analysisResults.analysisType} Analysis - AthleteHub`,
      text: `Check out my cricket analysis! Max speed: ${analysisResults.maxSpeed} km/h, Accuracy: ${analysisResults.accuracy}%`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
      alert('Results copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading cricket analysis results...</p>
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
          <h1 className="text-xl font-semibold">Cricket Analysis Results</h1>
          <div className="w-6"></div>
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Results Not Found</h2>
            <p className="text-gray-400 mb-6">{error || 'The cricket analysis results could not be loaded.'}</p>
            <Link 
              to="/cricket-analysis"
              className="bg-green-500 hover:bg-green-600 text-gray-900 font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Analyze New Cricket Video
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
        <h1 className="text-xl font-semibold">Cricket Analysis Results</h1>
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
            <div className="bg-green-500 p-3 rounded-full inline-block mb-4">
              <Trophy className="h-8 w-8 text-gray-900" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Cricket {analysisResults.analysisType === 'bowling' ? 'Bowling' : 'Batting'} Analysis Complete
            </h2>
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
                <span>Cricket Ball Successfully Detected & Tracked</span>
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
              <h3 className="text-xl font-semibold">Cricket Analysis Video</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowOriginal(false)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    !showOriginal 
                      ? 'bg-green-500 text-gray-900' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Video className="h-4 w-4 inline mr-2" />
                  With Analysis
                </button>
                <button
                  onClick={() => setShowOriginal(true)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    showOriginal 
                      ? 'bg-green-500 text-gray-900' 
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
                    <p className="text-sm mt-2">The cricket analysis video is being generated</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Description */}
            <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-green-500 mb-2">
                {showOriginal ? 'Original Cricket Video' : 'Cricket Analysis Video'}
              </h4>
              <p className="text-gray-300 text-sm">
                {showOriginal 
                  ? 'Your original cricket video as uploaded/recorded.'
                  : `Processed video showing ${analysisResults.analysisType} analysis with ball trajectory, speed measurements, and cricket-specific metrics.`
                }
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-2xl text-white">
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
              <p className="text-sm text-gray-500 mt-1">Throughout delivery</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-8 w-8 text-green-400" />
                <span className="text-3xl font-bold text-green-400">{analysisResults.accuracy}%</span>
              </div>
              <p className="text-gray-300 font-semibold">Detection Accuracy</p>
              <p className="text-sm text-gray-500 mt-1">Ball tracking precision</p>
            </div>
          </div>

          {/* Cricket-Specific Metrics */}
          {analysisResults.analysisType === 'bowling' && (
            <div className="bg-gray-800 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold mb-6 text-green-500">Bowling Analysis</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Swing Movement</span>
                    <span className="font-semibold text-green-400">{analysisResults.swingMovement?.toFixed(1)}°</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Seam Position</span>
                    <span className="font-semibold text-green-400 capitalize">{analysisResults.seamPosition}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Bounce Height</span>
                    <span className="font-semibold text-green-400">{analysisResults.bounceHeight?.toFixed(0)}cm</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Pitch Length</span>
                    <span className="font-semibold text-green-400">{analysisResults.pitchLength?.toFixed(1)}m</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Release Height</span>
                    <span className="font-semibold text-green-400">{analysisResults.releaseHeight?.toFixed(1)}m</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Flight Duration</span>
                    <span className="font-semibold text-green-400">{analysisResults.duration}s</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {analysisResults.analysisType === 'batting' && (
            <div className="bg-gray-800 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold mb-6 text-green-500">Batting Analysis</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Shot Power</span>
                    <span className="font-semibold text-green-400">{analysisResults.shotPower}/100</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Contact Point</span>
                    <span className="font-semibold text-green-400 capitalize">{analysisResults.contactPoint}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Shot Type</span>
                    <span className="font-semibold text-green-400 capitalize">{analysisResults.shotType}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Ball Distance</span>
                    <span className="font-semibold text-green-400">{analysisResults.distance}m</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Flight Time</span>
                    <span className="font-semibold text-green-400">{analysisResults.duration}s</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Trajectory Points</span>
                    <span className="font-semibold text-green-400">{analysisResults.trajectoryPoints}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/cricket-analysis"
              className="bg-green-500 hover:bg-green-600 text-gray-900 font-semibold px-8 py-3 rounded-full transition-colors text-center flex items-center justify-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>Analyze Another Cricket Video</span>
            </Link>
            <button 
              onClick={downloadResults}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-full transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Download Cricket Data</span>
            </button>
            <button 
              onClick={shareResults}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full transition-colors flex items-center justify-center space-x-2"
            >
              <Share2 className="h-5 w-5" />
              <span>Share Results</span>
            </button>
          </div>

          {/* Cricket Insights */}
          <div className="mt-8 bg-gradient-to-r from-green-800 to-emerald-700 rounded-2xl p-6">
            <h4 className="font-semibold text-green-300 mb-3">🏏 Cricket Performance Insights</h4>
            <div className="text-green-200 text-sm space-y-2">
              <p><strong>Your cricket analysis is ready for backend integration:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Cricket-specific YOLO model for ball detection</li>
                <li>Bowling analysis: swing, seam, bounce, pitch length</li>
                <li>Batting analysis: shot power, type, contact point</li>
                <li>Speed and trajectory measurements</li>
                <li>Video processing with cricket-specific overlays</li>
              </ul>
              <p className="mt-3">
                <strong>Ready for your cricket detection notebook integration!</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CricketResults;
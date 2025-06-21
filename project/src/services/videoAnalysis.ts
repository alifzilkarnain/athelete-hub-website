export interface AnalysisResult {
  sessionId: string;
  maxSpeed: number;
  avgSpeed: number;
  ballDetected: boolean;
  trajectoryPoints: number;
  accuracy: number;
  distance: number;
  duration: number;
  processedVideoUrl?: string;
  originalVideoUrl?: string;
  processingTime: number;
  timestamp: string;
  trajectoryData?: TrajectoryPoint[];
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  timestamp: number;
  speed: number;
}

export interface AnalysisProgress {
  stage: string;
  progress: number;
  message: string;
}

class VideoAnalysisService {
  private baseUrl = '/api'; // This would be your backend URL in production

  async uploadAndAnalyze(
    videoFile: File | Blob,
    onProgress?: (progress: AnalysisProgress) => void
  ): Promise<AnalysisResult> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Step 1: Upload video
      onProgress?.({
        stage: 'upload',
        progress: 10,
        message: 'Uploading video to server...'
      });

      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('sessionId', sessionId);

      // In a real implementation, this would upload to your backend
      // For now, we'll simulate the process
      await this.simulateUpload(onProgress);

      // Step 2: Process with YOLO
      onProgress?.({
        stage: 'processing',
        progress: 30,
        message: 'Initializing YOLO model...'
      });

      await this.simulateYOLOProcessing(onProgress);

      // Step 3: Generate trajectory video
      onProgress?.({
        stage: 'trajectory',
        progress: 70,
        message: 'Generating trajectory visualization...'
      });

      await this.simulateTrajectoryGeneration(onProgress);

      // Step 4: Calculate final results
      onProgress?.({
        stage: 'analysis',
        progress: 90,
        message: 'Calculating speed and trajectory metrics...'
      });

      const results = await this.generateResults(sessionId, videoFile);

      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'Analysis complete! Video with trajectory ready.'
      });

      return results;

    } catch (error) {
      console.error('Analysis failed:', error);
      throw new Error('Video analysis failed. Please try again.');
    }
  }

  private async simulateUpload(onProgress?: (progress: AnalysisProgress) => void): Promise<void> {
    // Simulate upload progress
    for (let i = 10; i <= 25; i += 3) {
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress?.({
        stage: 'upload',
        progress: i,
        message: `Uploading video... ${i}%`
      });
    }
  }

  private async simulateYOLOProcessing(onProgress?: (progress: AnalysisProgress) => void): Promise<void> {
    const stages = [
      'Loading YOLO model weights...',
      'Setting confidence threshold to 0.3...',
      'Processing frame 1/120...',
      'Ball detected in frame 15...',
      'Processing frame 30/120...',
      'Ball detected in frame 45...',
      'Processing frame 60/120...',
      'Ball detected in frame 75...',
      'Processing frame 90/120...',
      'Ball detected in frame 105...',
      'Processing frame 120/120...',
      'YOLO detection complete!'
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const progress = 30 + (i + 1) * (40 / stages.length);
      onProgress?.({
        stage: 'processing',
        progress: Math.round(progress),
        message: stages[i]
      });
    }
  }

  private async simulateTrajectoryGeneration(onProgress?: (progress: AnalysisProgress) => void): Promise<void> {
    const stages = [
      'Drawing ball trajectory path...',
      'Adding bounding boxes...',
      'Calculating speed annotations...',
      'Rendering trajectory video...',
      'Encoding output video...'
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const progress = 70 + (i + 1) * (20 / stages.length);
      onProgress?.({
        stage: 'trajectory',
        progress: Math.round(progress),
        message: stages[i]
      });
    }
  }

  private async generateResults(sessionId: string, videoFile: File | Blob): Promise<AnalysisResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate more realistic results based on video properties
    const videoSize = videoFile.size;
    const baseSpeed = 45 + (videoSize % 40); // Vary based on file size
    const variation = (Math.random() - 0.5) * 20; // Add some randomness
    
    const maxSpeed = Math.max(baseSpeed + variation + Math.random() * 15, 30);
    const avgSpeed = maxSpeed * (0.7 + Math.random() * 0.2); // 70-90% of max speed
    const trajectoryPoints = Math.floor(20 + Math.random() * 40);
    const accuracy = Math.floor(85 + Math.random() * 15);
    const distance = 15 + Math.random() * 20;
    const duration = 1.5 + Math.random() * 2;

    // Generate mock trajectory data
    const trajectoryData: TrajectoryPoint[] = [];
    for (let i = 0; i < trajectoryPoints; i++) {
      trajectoryData.push({
        x: 100 + i * 10 + Math.random() * 20,
        y: 300 - i * 5 + Math.random() * 30,
        timestamp: i * (duration / trajectoryPoints),
        speed: avgSpeed + (Math.random() - 0.5) * 20
      });
    }

    // Create mock processed video URL (in production, this would be the actual processed video)
    const processedVideoUrl = URL.createObjectURL(videoFile); // For demo, use original video

    return {
      sessionId,
      maxSpeed: Math.round(maxSpeed * 10) / 10,
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      ballDetected: Math.random() > 0.1, // 90% success rate
      trajectoryPoints,
      accuracy,
      distance: Math.round(distance * 10) / 10,
      duration: Math.round(duration * 10) / 10,
      processedVideoUrl, // This would be the video with trajectory overlay
      originalVideoUrl: URL.createObjectURL(videoFile),
      processingTime: 2.5 + Math.random() * 2,
      timestamp: new Date().toISOString(),
      trajectoryData
    };
  }

  async getAnalysisResult(sessionId: string): Promise<AnalysisResult | null> {
    // In production, this would fetch from your backend
    const stored = localStorage.getItem(`analysis_${sessionId}`);
    return stored ? JSON.parse(stored) : null;
  }

  async saveAnalysisResult(result: AnalysisResult): Promise<void> {
    // In production, this would save to your backend
    localStorage.setItem(`analysis_${result.sessionId}`, JSON.stringify(result));
  }

  // Method to handle backend integration for video processing
  async processVideoWithYOLO(videoFile: File | Blob, sessionId: string): Promise<string> {
    // This is where you would integrate with your Python backend
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('sessionId', sessionId);

    // Example API call to your Python backend:
    /*
    const response = await fetch('/api/process-video', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Video processing failed');
    }
    
    const result = await response.json();
    return result.processedVideoUrl;
    */

    // For now, return mock URL
    return `/api/processed-video/${sessionId}.mp4`;
  }
}

export const videoAnalysisService = new VideoAnalysisService();
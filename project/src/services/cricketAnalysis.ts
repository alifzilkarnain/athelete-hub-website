export interface CricketAnalysisResult {
  sessionId: string;
  analysisType: 'bowling' | 'batting';
  maxSpeed: number;
  avgSpeed: number;
  ballDetected: boolean;
  trajectoryPoints: number;
  accuracy: number;
  
  // Cricket-specific metrics
  swingMovement?: number; // degrees of swing
  seamPosition?: string; // upright, scrambled, etc.
  bounceHeight?: number; // cm
  pitchLength?: number; // meters
  releaseHeight?: number; // meters
  
  // Batting specific
  shotPower?: number; // relative power rating
  contactPoint?: string; // front foot, back foot, etc.
  shotType?: string; // drive, pull, cut, etc.
  
  distance: number;
  duration: number;
  processedVideoUrl?: string;
  originalVideoUrl?: string;
  processingTime: number;
  timestamp: string;
  trajectoryData?: CricketTrajectoryPoint[];
}

export interface CricketTrajectoryPoint {
  x: number;
  y: number;
  timestamp: number;
  speed: number;
  swingAngle?: number;
  seamAngle?: number;
}

export interface CricketAnalysisProgress {
  stage: string;
  progress: number;
  message: string;
}

class CricketAnalysisService {
  private baseUrl = '/api'; // This would be your backend URL in production

  async uploadAndAnalyze(
    videoFile: File | Blob,
    analysisType: 'bowling' | 'batting',
    onProgress?: (progress: CricketAnalysisProgress) => void
  ): Promise<CricketAnalysisResult> {
    const sessionId = `cricket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Step 1: Upload video
      onProgress?.({
        stage: 'upload',
        progress: 10,
        message: 'Uploading cricket video to server...'
      });

      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('sessionId', sessionId);
      formData.append('analysisType', analysisType);

      await this.simulateUpload(onProgress);

      // Step 2: Cricket-specific YOLO processing
      onProgress?.({
        stage: 'processing',
        progress: 30,
        message: 'Initializing cricket ball detection model...'
      });

      await this.simulateCricketProcessing(onProgress, analysisType);

      // Step 3: Generate trajectory and cricket metrics
      onProgress?.({
        stage: 'trajectory',
        progress: 70,
        message: 'Analyzing ball movement and cricket metrics...'
      });

      await this.simulateCricketMetrics(onProgress, analysisType);

      // Step 4: Calculate final results
      onProgress?.({
        stage: 'analysis',
        progress: 90,
        message: 'Calculating cricket performance metrics...'
      });

      const results = await this.generateCricketResults(sessionId, videoFile, analysisType);

      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'Cricket analysis complete!'
      });

      return results;

    } catch (error) {
      console.error('Cricket analysis failed:', error);
      throw new Error('Cricket video analysis failed. Please try again.');
    }
  }

  private async simulateUpload(onProgress?: (progress: CricketAnalysisProgress) => void): Promise<void> {
    for (let i = 10; i <= 25; i += 3) {
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress?.({
        stage: 'upload',
        progress: i,
        message: `Uploading cricket video... ${i}%`
      });
    }
  }

  private async simulateCricketProcessing(
    onProgress?: (progress: CricketAnalysisProgress) => void,
    analysisType?: 'bowling' | 'batting'
  ): Promise<void> {
    const bowlingStages = [
      'Loading cricket ball detection model...',
      'Detecting bowling action...',
      'Tracking ball from release point...',
      'Analyzing seam position...',
      'Measuring swing movement...',
      'Calculating pitch length...',
      'Processing delivery frames...',
      'Cricket bowling analysis complete!'
    ];

    const battingStages = [
      'Loading cricket ball detection model...',
      'Detecting batting stroke...',
      'Tracking ball after contact...',
      'Analyzing shot power...',
      'Identifying shot type...',
      'Measuring ball trajectory...',
      'Processing batting frames...',
      'Cricket batting analysis complete!'
    ];

    const stages = analysisType === 'bowling' ? bowlingStages : battingStages;

    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
      const progress = 30 + (i + 1) * (40 / stages.length);
      onProgress?.({
        stage: 'processing',
        progress: Math.round(progress),
        message: stages[i]
      });
    }
  }

  private async simulateCricketMetrics(
    onProgress?: (progress: CricketAnalysisProgress) => void,
    analysisType?: 'bowling' | 'batting'
  ): Promise<void> {
    const bowlingStages = [
      'Calculating swing degrees...',
      'Analyzing seam orientation...',
      'Measuring bounce characteristics...',
      'Computing speed variations...',
      'Generating bowling trajectory...'
    ];

    const battingStages = [
      'Analyzing shot power...',
      'Identifying contact point...',
      'Classifying shot type...',
      'Measuring ball distance...',
      'Generating batting trajectory...'
    ];

    const stages = analysisType === 'bowling' ? bowlingStages : battingStages;

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

  private async generateCricketResults(
    sessionId: string, 
    videoFile: File | Blob, 
    analysisType: 'bowling' | 'batting'
  ): Promise<CricketAnalysisResult> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const videoSize = videoFile.size;
    const baseSpeed = analysisType === 'bowling' ? 120 + (videoSize % 30) : 80 + (videoSize % 40);
    const variation = (Math.random() - 0.5) * 20;
    
    const maxSpeed = Math.max(baseSpeed + variation + Math.random() * 15, 
                             analysisType === 'bowling' ? 100 : 60);
    const avgSpeed = maxSpeed * (0.8 + Math.random() * 0.15);
    const trajectoryPoints = Math.floor(30 + Math.random() * 50);
    const accuracy = Math.floor(88 + Math.random() * 12);
    const distance = analysisType === 'bowling' ? 20 + Math.random() * 2 : 50 + Math.random() * 100;
    const duration = analysisType === 'bowling' ? 0.8 + Math.random() * 0.4 : 2 + Math.random() * 3;

    // Generate cricket-specific metrics
    const cricketMetrics = analysisType === 'bowling' ? {
      swingMovement: Math.random() * 15, // 0-15 degrees
      seamPosition: ['upright', 'scrambled', 'cross-seam'][Math.floor(Math.random() * 3)],
      bounceHeight: 60 + Math.random() * 40, // 60-100 cm
      pitchLength: 18 + Math.random() * 4, // 18-22 meters
      releaseHeight: 2.2 + Math.random() * 0.4 // 2.2-2.6 meters
    } : {
      shotPower: Math.floor(60 + Math.random() * 40), // 60-100 power rating
      contactPoint: ['front foot', 'back foot', 'on the crease'][Math.floor(Math.random() * 3)],
      shotType: ['drive', 'pull', 'cut', 'sweep', 'flick'][Math.floor(Math.random() * 5)]
    };

    // Generate trajectory data
    const trajectoryData: CricketTrajectoryPoint[] = [];
    for (let i = 0; i < trajectoryPoints; i++) {
      trajectoryData.push({
        x: 100 + i * 8 + Math.random() * 15,
        y: analysisType === 'bowling' ? 
            300 - i * 3 + Math.random() * 20 : // Bowling trajectory (downward)
            200 + Math.sin(i * 0.2) * 50 + Math.random() * 10, // Batting trajectory (arc)
        timestamp: i * (duration / trajectoryPoints),
        speed: avgSpeed + (Math.random() - 0.5) * 25,
        swingAngle: analysisType === 'bowling' ? Math.random() * 10 - 5 : undefined,
        seamAngle: analysisType === 'bowling' ? Math.random() * 360 : undefined
      });
    }

    const processedVideoUrl = URL.createObjectURL(videoFile);

    return {
      sessionId,
      analysisType,
      maxSpeed: Math.round(maxSpeed * 10) / 10,
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      ballDetected: Math.random() > 0.05, // 95% success rate for cricket
      trajectoryPoints,
      accuracy,
      distance: Math.round(distance * 10) / 10,
      duration: Math.round(duration * 10) / 10,
      processedVideoUrl,
      originalVideoUrl: URL.createObjectURL(videoFile),
      processingTime: 3 + Math.random() * 2,
      timestamp: new Date().toISOString(),
      trajectoryData,
      ...cricketMetrics
    };
  }

  async getAnalysisResult(sessionId: string): Promise<CricketAnalysisResult | null> {
    const stored = localStorage.getItem(`cricket_analysis_${sessionId}`);
    return stored ? JSON.parse(stored) : null;
  }

  async saveAnalysisResult(result: CricketAnalysisResult): Promise<void> {
    localStorage.setItem(`cricket_analysis_${result.sessionId}`, JSON.stringify(result));
  }
}

export const cricketAnalysisService = new CricketAnalysisService();
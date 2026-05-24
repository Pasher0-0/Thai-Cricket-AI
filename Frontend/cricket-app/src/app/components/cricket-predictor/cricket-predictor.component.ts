import { Component, inject, AfterViewInit, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CricketApiService } from '../../services/cricket-api.service';

interface RecordingHistoryItem {
  id: string;
  timestamp: number;
  duration: number;
  blob: string; // base64 encoded
  filename: string;
  species?: string;
  confidence?: number;
  analysis?: any;
}

@Component({
  selector: 'app-cricket-predictor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cricket-predictor.component.html',
  styleUrls: ['./cricket-predictor.component.css']
})
export class CricketPredictorComponent implements OnInit {
  private cricketApi = inject(CricketApiService);
  private ngZone = inject(NgZone);
  private mediaStream: MediaStream | null = null;

  selectedFile: File | null = null;
  isLoading: boolean = false;
  progressValue: number = 0;
  
  resultData: any = null;
  errorMessage: string = '';

  // Recording properties
  isRecording: boolean = false;
  recordedBlob: Blob | null = null;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: BlobPart[] = [];
  recordingDuration: number = 0;
  recordingInterval: any = null;
  
  // Tab selection
  inputMode: 'upload' | 'record' = 'upload';

  // Recording history
  recordingHistory: RecordingHistoryItem[] = [];
  showHistory: boolean = false;
  maxHistoryItems: number = 10; // Keep last 10 recordings

  // Map species to image file names
  speciesImageMap: { [key: string]: string } = {
    'G. bimaculatus': 'gryllus_bimaculatus.jpg',
    'T. derelictus': 'teleogryllus_derelictus.jpg',
    'T. mitratus': 'teleogryllus_mitratus.jpg',
    'T. occipitalis': 'teleogryllus_occipitalis.jpg',
    'T. portentosus': 'tarbinskiellus_portentosus.jpg',
  };

  ngOnInit() {
    this.loadRecordingHistory();
  }

  getBreedImage(): string | null {
    if (!this.resultData?.species) return null;
    const fileName = this.speciesImageMap[this.resultData.species];
    return fileName ? `assets/images/${fileName}` : null;
  }

  private saveToHistory() {
    if (!this.recordedBlob) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = (reader.result as string).split(',')[1] || '';
      
      const historyItem: RecordingHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        duration: this.recordingDuration,
        blob: base64Audio,
        filename: `recording_${new Date().toLocaleString().replace(/[^\\/\\-\\s\\d\\:]/g, '')}`,
        species: this.resultData?.species,
        confidence: this.resultData?.confidence,
        analysis: this.resultData
      };
      
      this.recordingHistory.unshift(historyItem);
      
      // Keep only last N items
      if (this.recordingHistory.length > this.maxHistoryItems) {
        this.recordingHistory = this.recordingHistory.slice(0, this.maxHistoryItems);
      }
      
      this.persistHistory();
    };
    reader.readAsDataURL(this.recordedBlob);
  }

  private persistHistory() {
    try {
      const historyToSave = this.recordingHistory.map(item => ({
        ...item,
      }));
      localStorage.setItem('cricketRecordingHistory', JSON.stringify(historyToSave));
    } catch (error) {
      console.warn('Failed to save recording history:', error);
    }
  }

  private loadRecordingHistory() {
    try {
      const stored = localStorage.getItem('cricketRecordingHistory');
      if (stored) {
        this.recordingHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load recording history:', error);
      this.recordingHistory = [];
    }
  }

  deleteFromHistory(id: string) {
    this.recordingHistory = this.recordingHistory.filter(item => item.id !== id);
    this.persistHistory();
  }

  loadFromHistory(item: RecordingHistoryItem) {
    // Convert base64 back to Blob
    const binaryString = atob(item.blob);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/wav' });
    
    this.recordedBlob = blob;
    this.selectedFile = new File([blob], item.filename, { type: 'audio/wav' });
    this.recordingDuration = item.duration;
    this.inputMode = 'record';
    this.showHistory = false;
  }

  downloadFromHistory(item: RecordingHistoryItem) {
    const binaryString = atob(item.blob);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.filename}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  }

  clearAllHistory() {
    if (confirm('Are you sure you want to delete all recordings? This cannot be undone.')) {
      this.recordingHistory = [];
      localStorage.removeItem('cricketRecordingHistory');
      this.showHistory = false;
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  private cleanupRecording() {
    // Stop the interval timer
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    
    // Stop and close media recorder
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    
    // Stop all media tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    this.isRecording = false;
    this.mediaRecorder = null;
  }

  async startRecording() {
    try {
      // Clean up any existing recording first
      this.cleanupRecording();
      
      this.audioChunks = [];
      this.recordingDuration = 0;
      this.errorMessage = '';
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.mediaStream);
      
      // Wrap handlers in ngZone.run() to trigger change detection
      this.mediaRecorder.ondataavailable = (event) => {
        this.ngZone.run(() => {
          this.audioChunks.push(event.data);
        });
      };
      
      this.mediaRecorder.onstop = () => {
        this.ngZone.run(() => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          this.recordedBlob = audioBlob;
          this.selectedFile = new File([audioBlob], 'recorded_audio.wav', { type: 'audio/wav' });
        });
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      
      // Start timer
      this.recordingInterval = setInterval(() => {
        this.recordingDuration++;
      }, 1000);
      
    } catch (error) {
      this.errorMessage = 'ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาตรวจสอบสิทธิ์การเข้าถึง';
      console.error('Error accessing microphone:', error);
      this.cleanupRecording();
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval);
        this.recordingInterval = null;
      }
      
      // Stop media tracks
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }
    }
  }

  playRecording() {
    if (this.recordedBlob) {
      const url = URL.createObjectURL(this.recordedBlob);
      const audio = new Audio(url);
      audio.play();
    }
  }

  clearRecording() {
    this.cleanupRecording();
    this.recordedBlob = null;
    this.selectedFile = null;
    this.recordingDuration = 0;
    this.audioChunks = [];
  }

  switchInputMode(mode: 'upload' | 'record') {
    // Clean up recording if switching away from record mode
    if (this.inputMode === 'record' && mode !== 'record') {
      this.cleanupRecording();
    }
    this.inputMode = mode;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.recordedBlob = null;
      this.resultData = null;
      this.errorMessage = '';
    }
  }

  analyzeAudio() {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.progressValue = 25;
    
    const progressInterval = setInterval(() => {
      if (this.progressValue < 90) this.progressValue += 10;
    }, 500);

    this.cricketApi.predictAudio(this.selectedFile).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.progressValue = 100;
        
        setTimeout(() => {
          this.resultData = response;
          this.isLoading = false;
          
          // Save to history if this was a recorded audio
          if (this.recordedBlob) {
            this.saveToHistory();
          }
        }, 500);
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isLoading = false;
        this.errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ AI ได้ กรุณาลองใหม่อีกครั้ง';
        console.error(error);
      }
    });
  }
}
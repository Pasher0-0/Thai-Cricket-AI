from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import numpy as np
import librosa
from huggingface_hub import snapshot_download
from tensorflow.keras.models import load_model
import os
import tempfile
import uvicorn
from pydub import AudioSegment 
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# โหลดสมองกล

repo_id = "your-username/cricket-model"
token = os.environ.get("HF_TOKEN")  # ถ้า repo private, ตั้ง secret ใน Space

cache_dir = snapshot_download(repo_id=repo_id, use_auth_token=token)
model_path = os.path.join(cache_dir, "cricket_model.h5")
model = load_model(model_path)
SPECIES_NAMES = ['G. bimaculatus', 'T. derelictus', 'T. mitratus', 'T. occipitalis', 'T. portentosus']

# ข้อมูลสายพันธุ์จิ้งหรีด
SPECIES_INFO = {
    'G. bimaculatus': {
        'common_name': 'Two-spotted Cricket',
        'thai_name': 'จิ้งหรีดทองดำ',
        'description': 'เป็นจิ้งหรีดทั่วไปที่พบได้ทั่วโลก มีสีดำเข้ม และมีจุดสีขาวขนาดเล็กสองจุดบนหัว',
        'frequency_range': '4-5 kHz',
        'size': '15-20 mm',
        'habitat': 'พื้นที่เปิด บ้าน และสถานที่อุ่น',
        'behavior': 'ร้องเสียงสูงและดังเด่น โดยทั่วไปอยู่ที่พื้นดิน',
        'distribution': 'กระจายอยู่ทั่วโลก',
        'color': 'ดำเข้ม'
    },
    'T. derelictus': {
        'common_name': 'Derelict Cricket',
        'thai_name': 'จิ้งหรีด Derelict',
        'description': 'สายพันธุ์จิ้งหรีดขนาดกลาง มีสีน้ำตาลเข้มและเทาเป็นลาย',
        'frequency_range': '3-4 kHz',
        'size': '12-16 mm',
        'habitat': 'พื้นที่แห้งและหินลาด',
        'behavior': 'ร้องเสียงต่ำ ชอบซ่อนตัวในรูปหินและก้อนดิน',
        'distribution': 'ท้องทะเลเมดิเตอร์เรเนียน',
        'color': 'น้ำตาลเทา'
    },
    'T. mitratus': {
        'common_name': 'Mitered Cricket',
        'thai_name': 'จิ้งหรีดมิเตรท',
        'description': 'จิ้งหรีดขนาดเล็กที่มีรูปร่างเหมือนมิเตอร์ (หมวก) บนหัว',
        'frequency_range': '5-6 kHz',
        'size': '10-14 mm',
        'habitat': 'พื้นที่ป่าชุ่มชื้นและหญ้า',
        'behavior': 'ร้องเสียงสูงและชื่น โดยทั่วไปหลบซ่อนตัวในกระบองไม้',
        'distribution': 'ยุโรปกลาง',
        'color': 'น้ำตาลอ่อน'
    },
    'T. occipitalis': {
        'common_name': 'Occiput Cricket',
        'thai_name': 'จิ้งหรีดออกซิพิทัล',
        'description': 'จิ้งหรีดที่มีเครื่องหมายที่ด้านหลังของหัว (occiput) ชัดเจน',
        'frequency_range': '4-5 kHz',
        'size': '13-17 mm',
        'habitat': 'พื้นที่สมบูรณ์และรกไม้',
        'behavior': 'ร้องเสียงกลางคืน โดยทั่วไปอยู่บนพื้นดินและใบไม้',
        'distribution': 'เอเชียตะวันออก',
        'color': 'น้ำตาลมะหาด'
    },
    'T. portentosus': {
        'common_name': 'Portentous Cricket',
        'thai_name': 'จิโปม',
        'description': 'สายพันธุ์จิ้งหรีดที่มีความหลากหลายทางสัณฐานวิทยา มีสีที่แปรปรวน',
        'frequency_range': '5-7 kHz',
        'size': '14-18 mm',
        'habitat': 'พื้นที่หญ้ากว้างและสวนสาธารณะ',
        'behavior': 'ร้องเสียงลักษณ์ฉันท์ โดยทั่วไปหากระบึกและเกาะไม้',
        'distribution': 'ยุโรปตะวันออก',
        'color': 'น้ำตาลกลาง'
    }
}

# ตั้งค่า
SAMPLE_RATE = 22050
DURATION = 3
SAMPLES_PER_TRACK = SAMPLE_RATE * DURATION
N_MELS = 128
N_FFT = 2048
HOP_LENGTH = 512

def generate_mel_spectrogram_image(file_path, segment_num=None):
    """Generate Mel-Spectrogram image and return as base64"""
    signal, sr = librosa.load(file_path, sr=SAMPLE_RATE)
    
    if segment_num is not None:
        # Extract specific segment
        start_sample = segment_num * SAMPLES_PER_TRACK
        end_sample = start_sample + SAMPLES_PER_TRACK
        segment = signal[start_sample:end_sample]
    else:
        segment = signal
    
    # Create mel spectrogram
    mel_spec = librosa.feature.melspectrogram(y=segment, sr=sr, n_fft=N_FFT, hop_length=HOP_LENGTH, n_mels=N_MELS)
    mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
    
    # Create figure
    fig, ax = plt.subplots(figsize=(12, 6))
    im = ax.imshow(mel_spec_db, aspect='auto', origin='lower', cmap='viridis')
    
    # Convert y-axis to kHz (Mel scale to Hz conversion)
    mel_freqs = librosa.mel_frequencies(n_mels=N_MELS)
    y_ticks = np.linspace(0, N_MELS-1, 6)
    y_labels = [f'{f/1000:.1f}' for f in librosa.mel_frequencies(n_mels=N_MELS)[::N_MELS//5]]
    ax.set_yticks(y_ticks)
    ax.set_yticklabels(y_labels)
    
    ax.set_xlabel('Time (frames)', fontsize=12)
    ax.set_ylabel('Frequency (kHz)', fontsize=12)
    
    if segment_num is not None:
        ax.set_title(f'Mel-Spectrogram - Segment {segment_num + 1} (3 seconds)', fontsize=14, fontweight='bold')
    else:
        ax.set_title('Mel-Spectrogram (Full Audio)', fontsize=14, fontweight='bold')
    
    cbar = plt.colorbar(im, ax=ax)
    cbar.set_label('Amplitude (dB)', fontsize=10)
    plt.tight_layout()
    
    # Convert to base64
    buffer = io.BytesIO()
    fig.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
    plt.close(fig)
    
    return f"data:image/png;base64,{image_base64}"

def preprocess_long_audio(file_path):
    signal, sr = librosa.load(file_path, sr=SAMPLE_RATE)
    total_samples = len(signal)
    
    # [แก้ไขใหม่: นำเสียงมาต่อกันถ้าสั้นกว่า 3 วินาที]
    if total_samples < SAMPLES_PER_TRACK:
        # 1. คำนวณว่าต้องทำซ้ำกี่รอบ (เช่น ถ้ามี 1 วิ ต้องทำซ้ำ 3 รอบ)
        repeats = int(np.ceil(SAMPLES_PER_TRACK / total_samples))
        # 2. นำข้อมูลเสียงมาต่อกัน (Looping)
        signal = np.tile(signal, repeats)
        # 3. ตัดส่วนเกินที่ล้นออกให้เหลือ 3 วินาทีเป๊ะๆ (ป้องกันกรณีเศษเกิน)
        signal = signal[:SAMPLES_PER_TRACK]
        total_samples = len(signal)

    num_segments = total_samples // SAMPLES_PER_TRACK
    X_batch = []
    
    for s in range(num_segments):
        start_sample = s * SAMPLES_PER_TRACK
        end_sample = start_sample + SAMPLES_PER_TRACK
        segment = signal[start_sample:end_sample]
        
        mel_spec = librosa.feature.melspectrogram(y=segment, sr=sr, n_fft=N_FFT, hop_length=HOP_LENGTH, n_mels=N_MELS)
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
        X_batch.append(mel_spec_db)
        
    X_batch = np.array(X_batch)
    X_batch = X_batch[..., np.newaxis] 
    return X_batch

@app.post("/predict")
async def predict_cricket(file: UploadFile = File(...)):
    tmp_input_path = None
    tmp_wav_path = None
    try:
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_in:
            tmp_in.write(await file.read())
            tmp_input_path = tmp_in.name

        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_wav:
            tmp_wav_path = tmp_wav.name

        audio = AudioSegment.from_file(tmp_input_path)
        audio.export(tmp_wav_path, format="wav")

        # Get audio metadata
        signal, sr = librosa.load(tmp_wav_path, sr=SAMPLE_RATE)
        duration_seconds = len(signal) / sr
        file_size_bytes = os.path.getsize(tmp_input_path)
        
        # Get bit depth from audio segment
        bit_depth = audio.sample_width * 8
        num_channels = audio.channels
        
        X_input = preprocess_long_audio(tmp_wav_path)
        predictions = model.predict(X_input) 
        avg_predictions = np.mean(predictions, axis=0)
        
        best_index = np.argmax(avg_predictions)
        confidence = float(avg_predictions[best_index])
        
        # 🛡️ ส่วนที่เพิ่มเข้ามา: ป้องกันการมั่วของ AI (Threshold = 80%)
        # ตรวจสอบว่าความมั่นใจสูงพอหรือไม่ ถ้าต่ำกว่า 80% ถือว่าไม่ใช่จิ้งหรีด
        CONFIDENCE_THRESHOLD = 0.80
        
        if confidence < CONFIDENCE_THRESHOLD:
            best_species = "ไม่สามารถระบุได้ / ไม่ใช่จิ้งหรีด"
            is_valid_cricket = False
            confidence_message = f"AI ไม่มั่นใจ (ความมั่นใจเพียง {confidence * 100:.2f}%) กรุณาอัดเสียงใหม่ในที่เงียบ หรือเสียงนี้อาจไม่ใช่เสียงจิ้งหรีด"
        else:
            best_species = SPECIES_NAMES[best_index]
            is_valid_cricket = True
            confidence_message = f"วิเคราะห์จากความยาว {len(X_input) * 3} วินาที (หากไฟล์สั้นกว่า 3 วิ ระบบได้ทำการ Loop เสียงแล้ว)"
        
        # Get breed details เฉพาะเมื่อเป็นจิ้งหรีดแท้
        breed_details = SPECIES_INFO.get(best_species, {}) if is_valid_cricket else {}
        
        # Generate Mel-Spectrogram for each segment
        segment_images = []
        for seg_idx in range(len(X_input)):
            mel_spec_img = generate_mel_spectrogram_image(tmp_wav_path, segment_num=seg_idx)
            segment_images.append({
                "segment_number": seg_idx + 1,
                "duration": "3 seconds",
                "image": mel_spec_img
            })
        
        # Create prediction data for all species
        species_predictions = [
            {
                "species": species_name,
                "confidence": float(avg_predictions[i]) * 100,
                "confidence_percent": f"{float(avg_predictions[i]) * 100:.2f}%"
            }
            for i, species_name in enumerate(SPECIES_NAMES)
        ]
        # Sort by confidence descending
        species_predictions.sort(key=lambda x: x["confidence"], reverse=True)
        
        # Audio characteristics
        audio_characteristics = {
            "duration_seconds": round(duration_seconds, 2),
            "sample_rate_hz": SAMPLE_RATE,
            "sample_rate_khz": round(SAMPLE_RATE / 1000, 1),
            "bit_depth": bit_depth,
            "channels": num_channels,
            "file_size_bytes": file_size_bytes,
            "file_size_mb": round(file_size_bytes / (1024 * 1024), 2),
            "format": file_extension.lstrip('.')
        }
        
        result = {
            "status": "success",
            "original_file": file.filename,
            "species": best_species,
            "confidence": f"{confidence * 100:.2f}%",
            "confidence_decimal": confidence,
            "is_valid_cricket": is_valid_cricket,
            "segments_analyzed": len(X_input),
            "all_predictions": species_predictions,
            "audio_characteristics": audio_characteristics,
            "segment_spectrograms": segment_images,
            "breed_details": breed_details,
            "message": confidence_message
        }
        
        return JSONResponse(result)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse({"status": "error", "message": f"เกิดข้อผิดพลาดในการอ่าน/แปลงไฟล์: {str(e)}"}, status_code=500)
        
    finally:
        if tmp_input_path and os.path.exists(tmp_input_path):
            os.remove(tmp_input_path)
        if tmp_wav_path and os.path.exists(tmp_wav_path):
            os.remove(tmp_wav_path)

@app.get("/")
def read_root():
    return {"message": "เซิร์ฟเวอร์ AI จิ้งหรีด (แปลงไฟล์อัตโนมัติ + Loop เสียงสั้น) พร้อมทำงานแล้ว!"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
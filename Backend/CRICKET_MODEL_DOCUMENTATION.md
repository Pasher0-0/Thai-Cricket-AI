# 📚 เอกสารการใช้งาน Cricket Model (cricket_model.h5)

## 📖 สารบัญ
1. [ภาพรวมทั่วไป](#ภาพรวมทั่วไป)
2. [สปีชี่ส์ที่สามารถจำแนกได้](#สปีชี่สที่สามารถจำแนกได้)
3. [ข้อกำหนดทางเทคนิค](#ข้อกำหนดทางเทคนิค)
4. [วิธีการโหลดและใช้งานโมเดล](#วิธีการโหลดและใช้งานโมเดล)
5. [รูปแบบข้อมูลอินพุต](#รูปแบบข้อมูลอินพุต)
6. [รูปแบบข้อมูลเอาต์พุต](#รูปแบบข้อมูลเอาต์พุต)
7. [ตัวอย่างการใช้งาน](#ตัวอย่างการใช้งาน)
8. [คำแนะนำและเทคนิคการใช้งาน](#คำแนะนำและเทคนิคการใช้งาน)
9. [การแก้ไขปัญหาทั่วไป](#การแก้ไขปัญหาทั่วไป)

---

## ภาพรวมทั่วไป

**cricket_model.h5** เป็นโมเดลเครือข่ายประสาทเทียมที่ผ่านการฝึกอบรมแล้วสำหรับการจำแนกประเภทของจิ้งหรีดจากไฟล์เสียง

### ลักษณะเด่น:
- ✅ จำแนกจิ้งหรีดได้ 5 สปีชี่ส์ที่แตกต่างกัน
- ✅ ใช้การวิเคราะห์ Mel-Spectrogram สำหรับประมวลผลเสียง
- ✅ รองรับไฟล์เสียงหลายฟอร์แมต (.mp3, .wav, .ogg เป็นต้น)
- ✅ ความยาวเสียงอย่างน้อย 3 วินาที (สำหรับ 1 segment)
- ✅ มีระบบป้องกันการมั่วของ AI (Confidence Threshold = 80%)

---

## สปีชี่ส์ที่สามารถจำแนกได้

| ลำดับที่ | ชื่อ IPA | ชื่อทั่วไป | ชื่อไทย |
|---------|---------|----------|--------|
| 1 | **G. bimaculatus** | Two-spotted Cricket | จิ้งหรีดทองดำ |
| 2 | **T. derelictus** | Derelict Cricket | จิ้งหรีด Derelict |
| 3 | **T. mitratus** | Mitered Cricket | จิ้งหรีดมิเตรท |
| 4 | **T. occipitalis** | Occiput Cricket | จิ้งหรีดออกซิพิทัล |
| 5 | **T. portentosus** | Portentous Cricket | จิโปม |

---

## ข้อกำหนดทางเทคนิค

### สิ่งที่จำเป็นต้องติดตั้ง:
```bash
pip install tensorflow
pip install librosa
pip install numpy
pip install pydub
```

### พารามิเตอร์โมเดล:
| พารามิเตอร์ | ค่า | หมายเหตุ |
|-----------|-----|--------|
| **SAMPLE_RATE** | 22,050 Hz | ความถี่ในการสุ่มตัวอย่าง |
| **DURATION** | 3 วินาที | ความยาวของเซกเมนต์ที่วิเคราะห์ |
| **SAMPLES_PER_TRACK** | 66,150 | จำนวนตัวอย่างต่อเซกเมนต์ |
| **N_MELS** | 128 | จำนวน Mel bins |
| **N_FFT** | 2,048 | ขนาด FFT |
| **HOP_LENGTH** | 512 | ความยาว hop สำหรับ STFT |
| **CONFIDENCE_THRESHOLD** | 0.80 (80%) | ขีดจำกัดความมั่นใจ |

---

## วิธีการโหลดและใช้งานโมเดล

### ขั้นตอนที่ 1: โหลดโมเดล
```python
from tensorflow.keras.models import load_model

# โหลดโมเดลจากไฟล์
model = load_model('cricket_model.h5')
```

### ขั้นตอนที่ 2: ตรวจสอบว่าโมเดลถูกโหลด
```python
# แสดงสถาปัตยกรรมของโมเดล
print(model.summary())

# ตรวจสอบอินพุตและเอาต์พุท
print(f"Input shape: {model.input_shape}")
print(f"Output shape: {model.output_shape}")
```

### ขั้นตอนที่ 3: ทำนาย (Prediction)
```python
# สมมติว่า X_input เป็น numpy array ที่มี shape (num_segments, 128, 130, 1)
predictions = model.predict(X_input)

# X_input shape สำหรับ 1 segment: (1, 128, 130, 1)
# X_input shape สำหรับหลาย segments: (num_segments, 128, 130, 1)
```

---

## รูปแบบข้อมูลอินพุต

### ต้องการข้อมูล:
**Mel-Spectrogram ในรูปแบบ 4D numpy array**

```
Shape: (batch_size, height, width, channels)
ตัวอย่าง: (1, 128, 130, 1)
         (5, 128, 130, 1)  ← 5 segments
```

### ขั้นตอนการเตรียมข้อมูล:

```python
import librosa
import numpy as np

# 1. โหลดไฟล์เสียง
SAMPLE_RATE = 22050
signal, sr = librosa.load('cricket_audio.wav', sr=SAMPLE_RATE)

# 2. แยกเป็น segments (3 วินาที ต่อ segment)
DURATION = 3
SAMPLES_PER_TRACK = SAMPLE_RATE * DURATION  # 66,150 samples

segment = signal[:SAMPLES_PER_TRACK]

# 3. สร้าง Mel-Spectrogram
N_MELS = 128
N_FFT = 2048
HOP_LENGTH = 512

mel_spec = librosa.feature.melspectrogram(
    y=segment, 
    sr=sr, 
    n_fft=N_FFT, 
    hop_length=HOP_LENGTH, 
    n_mels=N_MELS
)

# 4. แปลงเป็น dB scale
mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)

# 5. เพิ่ม channel dimension (จากแค่ mel_spec เป็น mel_spec ที่มี channel)
X_input = mel_spec_db[np.newaxis, ..., np.newaxis]  # Shape: (1, 128, 130, 1)
```

---

## รูปแบบข้อมูลเอาต์พุท

### โมเดลคืนค่า:
```python
predictions = model.predict(X_input)
# Shape: (num_segments, 5)
# แต่ละแถวคือ probability สำหรับแต่ละสปีชี่ส์
```

### ตัวอย่างผลลัพธ์:
```python
# สำหรับ 1 segment:
# [[0.85, 0.10, 0.03, 0.01, 0.01]]
#   ↑     ↑    ↑    ↑    ↑
#   G.bim T.der T.mit T.occ T.port

# ที่มีค่า 0.85 = 85% confidence ว่าเป็น G. bimaculatus
```

### วิธีการประมวลผลผลลัพธ์:
```python
SPECIES_NAMES = ['G. bimaculatus', 'T. derelictus', 'T. mitratus', 
                 'T. occipitalis', 'T. portentosus']

# หาค่าเฉลี่ยของทุก segments
avg_predictions = np.mean(predictions, axis=0)

# หาสปีชี่ส์ที่เป็นไปได้มากที่สุด
best_index = np.argmax(avg_predictions)
confidence = avg_predictions[best_index]
best_species = SPECIES_NAMES[best_index]

print(f"สปีชี่ส์: {best_species}")
print(f"ความมั่นใจ: {confidence * 100:.2f}%")
```

---

## ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: การจำแนกไฟล์เสียงเดี่ยว

```python
import numpy as np
import librosa
from tensorflow.keras.models import load_model

# ตั้งค่าพารามิเตอร์
SAMPLE_RATE = 22050
DURATION = 3
SAMPLES_PER_TRACK = SAMPLE_RATE * DURATION
N_MELS = 128
N_FFT = 2048
HOP_LENGTH = 512
SPECIES_NAMES = ['G. bimaculatus', 'T. derelictus', 'T. mitratus', 
                 'T. occipitalis', 'T. portentosus']

# โหลดโมเดล
model = load_model('cricket_model.h5')

# โหลดไฟล์เสียง
file_path = 'cricket_sound.wav'
signal, sr = librosa.load(file_path, sr=SAMPLE_RATE)

# สร้าง Mel-Spectrogram
segment = signal[:SAMPLES_PER_TRACK]
mel_spec = librosa.feature.melspectrogram(y=segment, sr=sr, n_fft=N_FFT, 
                                          hop_length=HOP_LENGTH, n_mels=N_MELS)
mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)

# เตรียมสำหรับโมเดล
X_input = mel_spec_db[np.newaxis, ..., np.newaxis]

# ทำนาย
predictions = model.predict(X_input)
confidence = predictions[0][np.argmax(predictions[0])]
species = SPECIES_NAMES[np.argmax(predictions[0])]

# แสดงผล
print(f"สปีชี่ส์: {species}")
print(f"ความมั่นใจ: {confidence * 100:.2f}%")
```

### ตัวอย่างที่ 2: การจำแนกไฟล์ยาว (หลาย segments)

```python
def preprocess_long_audio(file_path):
    """ประมวลผลไฟล์เสียงยาว"""
    signal, sr = librosa.load(file_path, sr=SAMPLE_RATE)
    total_samples = len(signal)
    
    # ถ้าเสียงสั้นกว่า 3 วิ ให้ loop เสียง
    if total_samples < SAMPLES_PER_TRACK:
        repeats = int(np.ceil(SAMPLES_PER_TRACK / total_samples))
        signal = np.tile(signal, repeats)
        signal = signal[:SAMPLES_PER_TRACK]
        total_samples = len(signal)
    
    # แยกเป็น segments
    num_segments = total_samples // SAMPLES_PER_TRACK
    X_batch = []
    
    for s in range(num_segments):
        start_sample = s * SAMPLES_PER_TRACK
        end_sample = start_sample + SAMPLES_PER_TRACK
        segment = signal[start_sample:end_sample]
        
        mel_spec = librosa.feature.melspectrogram(y=segment, sr=sr, n_fft=N_FFT, 
                                                  hop_length=HOP_LENGTH, n_mels=N_MELS)
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
        X_batch.append(mel_spec_db)
    
    X_batch = np.array(X_batch)
    X_batch = X_batch[..., np.newaxis]  # เพิ่ม channel dimension
    return X_batch

# ใช้งาน
X_input = preprocess_long_audio('long_cricket_sound.wav')
predictions = model.predict(X_input)

# หาค่าเฉลี่ยจากทุก segments
avg_predictions = np.mean(predictions, axis=0)
best_species = SPECIES_NAMES[np.argmax(avg_predictions)]
confidence = np.max(avg_predictions)

print(f"จำนวน segments: {len(X_input)}")
print(f"สปีชี่ส์: {best_species}")
print(f"ความมั่นใจเฉลี่ย: {confidence * 100:.2f}%")
```

### ตัวอย่างที่ 3: ระบบตรวจสอบความมั่นใจ (Confidence Threshold)

```python
CONFIDENCE_THRESHOLD = 0.80

# หลังจากทำนายแล้ว
confidence = np.max(avg_predictions)

if confidence < CONFIDENCE_THRESHOLD:
    result = {
        "status": "uncertain",
        "message": f"ไม่มั่นใจ (เพียง {confidence * 100:.2f}%)",
        "suggestion": "กรุณาอัดเสียงใหม่ในที่เงียบ"
    }
else:
    best_species = SPECIES_NAMES[np.argmax(avg_predictions)]
    result = {
        "status": "success",
        "species": best_species,
        "confidence": f"{confidence * 100:.2f}%"
    }

print(result)
```

---

## คำแนะนำและเทคนิคการใช้งาน

### 1️⃣ คุณภาพของเสียง
- **ที่เงียบ**: ไม่มีเสียงรบกวนพื้นหลัง (เสียงรถ, คน เป็นต้น)
- **ความเป็นชัด**: เสียงจิ้งหรีดควรชัดเจนและมี Loudness เพียงพอ
- **ระยะห่าง**: ให้ไมโครโฟนห่างจากจิ้งหรีดประมาณ 10-30 ซม.

### 2️⃣ ความยาวของเสียง
- **ความยาวขั้นต่ำ**: 3 วินาที (ระบบจะ loop หากน้อยกว่านี้)
- **ความยาวที่เหมาะสม**: 10-30 วินาที (เพื่อการจำแนกที่แม่นยำ)
- **ไฟล์หลาย segments**: ระบบจะประมวลผล segment ทั้งหมดแล้วหาค่าเฉลี่ย

### 3️⃣ การเพิ่มประสิทธิภาพ
```python
# ❌ ต่ำ: 1 segment
X_input = mel_spec_db[np.newaxis, ..., np.newaxis]

# ✅ ดี: 3-5 segments
X_input = np.array([mel_spec_db1, mel_spec_db2, mel_spec_db3, ...])
X_input = X_input[..., np.newaxis]

# สาเหตุ: หลาย segments ช่วยลด noise และปรับปรุงค่าเฉลี่ย
```

### 4️⃣ ฟอร์แมตไฟล์เสียง
**รองรับ**: MP3, WAV, OGG, FLAC, M4A
```python
# ระบบจะแปลงทุกไฟล์เป็น WAV ก่อนจำแนก
audio = AudioSegment.from_file(input_file)
audio.export(output_file, format="wav")
```

---

## การแก้ไขปัญหาทั่วไป

### ❓ ปัญหา: "Model not found" หรือ "Could not find model"
**วิธีแก้ไข**:
```python
import os
from pathlib import Path

# ตรวจสอบว่าไฟล์มีอยู่
model_path = 'cricket_model.h5'
if not os.path.exists(model_path):
    raise FileNotFoundError(f"ไม่พบไฟล์ {model_path}")

model = load_model(model_path)
```

### ❓ ปัญหา: "Input shape mismatch"
**วิธีแก้ไข**:
```python
# ตรวจสอบ shape ของข้อมูลอินพุท
print(f"Expected shape: (batch_size, 128, 130, 1)")
print(f"Your shape: {X_input.shape}")

# ตรวจสอบให้แน่ใจ:
# - 128 = N_MELS (จำนวน Mel bins)
# - 130 = จำนวน time frames
# - 1 = จำนวน channels (Grayscale)
```

### ❓ ปัญหา: "Out of Memory (OOM)"
**วิธีแก้ไข**:
```python
# ลดจำนวน segments ที่ประมวลผลพร้อมกัน
batch_size = 10  # แทนที่จะทำ 100 segments ต่อครั้ง

for i in range(0, len(X_input), batch_size):
    batch = X_input[i:i+batch_size]
    predictions_batch = model.predict(batch)
    # จัดการผลลัพธ์
```

### ❓ ปัญหา: "ความมั่นใจต่ำ (ต่ำกว่า 80%)"
**วิธีแก้ไข**:
1. ✅ ตรวจสอบคุณภาพเสียง (เงียบขึ้น ไม่มีเสียงรบกวน)
2. ✅ เพิ่มความยาวของเสียง (อย่างน้อย 10 วินาที)
3. ✅ ให้ชัดเจนมากขึ้น (ไมโครโฟนใกล้จิ้งหรีดมากขึ้น)
4. ✅ ทำการอัดเสียงใหม่

### ❓ ปัญหา: "Librosa error" เมื่อโหลดไฟล์เสียง
**วิธีแก้ไข**:
```python
try:
    signal, sr = librosa.load(file_path, sr=SAMPLE_RATE)
except Exception as e:
    print(f"ข้อผิดพลาด: {e}")
    # ลองแปลงไฟล์เป็น WAV ก่อน
    from pydub import AudioSegment
    audio = AudioSegment.from_file(file_path)
    audio.export("temp.wav", format="wav")
    signal, sr = librosa.load("temp.wav", sr=SAMPLE_RATE)
```

---

## 📊 ข้อมูลสปีชี่ส์เพิ่มเติม

### G. bimaculatus (จิ้งหรีดทองดำ)
- **ย่านความถี่**: 4-5 kHz
- **ขนาด**: 15-20 mm
- **สีสัน**: ดำเข้ม มีจุดสีขาวสองจุดบนหัว
- **อาหาร**: สัตว์เศษ, พืช, กระดาษ, ผ้า
- **ความเป็นอันตราย**: ต่ำ (แต่บางครั้งเป็นศัตรูพืช)

### T. derelictus (จิ้งหรีด Derelict)
- **ย่านความถี่**: 3-4 kHz
- **ขนาด**: 12-16 mm
- **สีสัน**: น้ำตาลเทา ลาย
- **ที่อยู่อาศัย**: พื้นที่แห้ง หินลาด

### T. mitratus (จิ้งหรีดมิเตรท)
- **ย่านความถี่**: 5-6 kHz
- **ขนาด**: 10-14 mm
- **สีสัน**: น้ำตาลอ่อน
- **ที่อยู่อาศัย**: ป่าชุ่มชื้น หญ้า

### T. occipitalis (จิ้งหรีดออกซิพิทัล)
- **ย่านความถี่**: 4-5 kHz
- **ขนาด**: 13-17 mm
- **สีสัน**: น้ำตาลมะหาด
- **ที่อยู่อาศัย**: พื้นที่สมบูรณ์ รกไม้

### T. portentosus (จิโปม)
- **ย่านความถี่**: 5-7 kHz
- **ขนาด**: 14-18 mm
- **สีสัน**: น้ำตาลกลาง แปรปรวน
- **ที่อยู่อาศัย**: หญ้ากว้าง สวนสาธารณะ

---

## 💡 สรุป

### ขั้นตอนเร็ว:
1. **โหลดโมเดล**: `model = load_model('cricket_model.h5')`
2. **เตรียมเสียง**: แปลงเป็น Mel-Spectrogram ขนาด `(batch, 128, 130, 1)`
3. **ทำนาย**: `predictions = model.predict(X_input)`
4. **ประมวลผล**: หาค่าเฉลี่ย → ตรวจสอบ threshold → ได้ผลลัพธ์

### ตรวจสอบความเหมาะสม:
- ✅ เสียงเงียบ (ไม่มีเสียงรบกวน)
- ✅ เสียงชัด (มี loudness เพียงพอ)
- ✅ ความยาว ≥ 3 วินาที (ยิ่งยาวยิ่งดี)
- ✅ confidence ≥ 80% (เป็นจิ้งหรีด)

---

**เวอร์ชัน**: 1.0  
**วันที่อัปเดต**: May 2026  
**ผู้สร้าง**: Supawit Poolbua
**ติดต่อ**: catlandthai900@gmail.com


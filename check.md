# Thai Cricket AI - Application Summary

## 1. App Overview
**Name**: Thai Cricket AI  
**Purpose**: Identify Thai cricket species by analyzing audio recordings using machine learning  
**Live URL**: https://thai-cricket-ai.vercel.app  
**Repository**: github.com/Pasher0-0/Thai-Cricket-AI

---

## 2. Architecture & Rendering

### Frontend Architecture
| Aspect | Details |
|--------|---------|
| **Framework** | Angular 19.2.0 |
| **Rendering Type** | **CSR (Client-Side Rendering)** |
| **Build Output** | `dist/cricket-app/browser/` |
| **Build Command** | `npm run build` |
| **Hosting** | Vercel (static file hosting) |
| **Deployment** | Automatic (GitHub → Vercel) |

### Rendering Decision
- ✅ **CSR Enabled** (pure client-side)
  - Angular app loads in browser, no server-side rendering
  - Fast first paint, good for SPA interactions
  - Suitable for static hosting (Vercel)
  
- ❌ **SSR Disabled** (intentionally removed)
  - Reason: Vercel free tier doesn't support Node.js serverless functions well
  - Removed `"server": "src/main.server.ts"` from `angular.json`
  - Set `"prerender": false` to prevent SSR during build
  - Prevents server-side localStorage errors

### Key Components
| Component | Purpose |
|-----------|---------|
| **AppComponent** | Root component, routing setup |
| **CricketPredictorComponent** | Main UI - audio recording, file upload, predictions |
| **HomeComponent** | Landing page |
| **CricketApiService** | HTTP client for backend communication |

### Features
- 🎤 **Audio Recording**: Real-time microphone input capture
- 📁 **File Upload**: Select pre-recorded audio files (WAV, MP3)
- 🔊 **Recording History**: localStorage-based history of past predictions
- 📊 **Prediction Display**: Species classification with confidence scores
- 🌐 **Responsive Design**: Bootstrap 5 CSS framework for mobile/desktop

---

## 3. Backend API

### Backend Architecture
| Aspect | Details |
|--------|---------|
| **Framework** | FastAPI (Python) |
| **Hosting** | Hugging Face Spaces (Docker container) |
| **API URL** | https://pasher0-0-cricket-api.hf.space |
| **Endpoint** | POST `/predict` |

### API Specification
**Request:**
```
POST https://pasher0-0-cricket-api.hf.space/predict
Content-Type: multipart/form-data

Body:
  file: [audio file - WAV, MP3, OGG, etc.]
```

**Response (200 OK):**
```json
{
  "species": "T. mitratus",
  "common_name": "Mitered Cricket",
  "confidence": 0.95,
  "frequency_range": "7-9 kHz",
  "thai_name": "จิ้งหรีดจิตรา",
  "description": "...",
  "color": "black with brown spots",
  "habitat": "...",
  "behavior": "..."
}
```

### Supported Species
1. **G. bimaculatus** - Two-spotted Cricket
2. **T. derelictus** - Derelict Cricket
3. **T. mitratus** - Mitered Cricket
4. **T. occipitalis** - Occipital Cricket
5. **T. portentosus** - Portentous Cricket

### ML Model
- **Model File**: `cricket_model.h5` (TensorFlow/Keras)
- **Input**: Audio file (any sample rate, auto-converted to 22kHz)
- **Processing**: Librosa for audio feature extraction, Mel-spectrograms
- **Output**: Species classification + confidence scores

---

## 4. API Communication Flow

```
┌─────────────────────────┐
│  Angular Frontend       │
│  (Vercel CDN)          │
└──────────┬──────────────┘
           │
           │ POST request
           │ (multipart/form-data)
           │
           ▼
┌─────────────────────────────────────────┐
│  HF Space FastAPI Backend               │
│  (Docker container)                     │
│  - CORS enabled for Vercel domain       │
│  - Validates audio file                 │
│  - Loads ML model                       │
│  - Returns predictions                  │
└──────────────────────────────────────────┘
```

**Call Method**: Direct CORS-enabled fetch from Angular to HF Space  
**No Proxy**: Angular calls `https://pasher0-0-cricket-api.hf.space/predict` directly  
**Reason**: Vercel's `/api/` routes are reserved for serverless functions; direct call is simpler & faster

---

## 5. Security Measures

### CORS Configuration
```python
# In Backend (app.py)
ALLOWED_ORIGINS = [
    "https://thai-cricket-ai.vercel.app",    # Production Vercel domain
    "http://localhost:4200"                   # Local development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Security Implication**:
- ✅ Only Vercel domain can call the API (blocks unauthorized domains)
- ✅ No wildcard `allow_origins=["*"]` (was too permissive)
- ✅ Credentials allowed (for future authentication)

### Frontend Security
- ✅ No API keys stored in frontend code
- ✅ All credentials/secrets in environment variables on HF Space
- ✅ HTTPS enforced (Vercel → HF Space)
- ✅ XSS protection: Angular's built-in sanitization
- ✅ CSRF protection: CORS prevents cross-origin requests

### Data Security
- ✅ Audio files uploaded directly to HF Space (not stored on Vercel)
- ✅ No persistent storage of user files
- ✅ HF Space auto-cleanup on container restart
- ⚠️ Audio processed in-memory during prediction, then discarded

### Potential Improvements
1. **Add API rate limiting** (prevent abuse)
2. **Add request validation** (file type, size checks)
3. **Add request logging** (audit trail)
4. **Add authentication** (API key or OAuth) if making paid API

---

## 6. Cost Analysis

### Current Costs: **$0/month** (Free Tier)

#### Vercel (Frontend)
| Item | Cost | Details |
|------|------|---------|
| Static File Hosting | Free | Unlimited domains, deployments, bandwidth |
| CDN | Free | Global edge network included |
| **Total** | **$0** | No charges for static Angular app |

**Limits**:
- Unlimited deployments
- 100 GB bandwidth/month
- 1000 Serverless Function invocations/day (not using)

#### Hugging Face Spaces (Backend)
| Item | Cost | Details |
|------|------|---------|
| Free Tier Container | Free | 16GB RAM, auto-pause after 48h inactivity |
| Paid Tier (Optional) | ~$10/month | Persistent uptime, higher resource priority |
| **Current** | **$0** | Using free tier |

**Limits**:
- Auto-pauses after 48h without activity (requires redeploy to restart)
- Shared CPU/GPU resources
- No guaranteed uptime SLA

#### GitHub (Repository)
| Item | Cost | Details |
|------|------|---------|
| Public Repository | Free | Unlimited repos, storage |
| GitHub Pages | Free | Not using (using Vercel instead) |
| **Total** | **$0** | No charges |

### **Total Current Monthly Cost: $0**

---

## 7. Cost Projections (Future Scaling)

### If Traffic Increases:

#### Scenario 1: 1,000 users/month
| Service | Cost | Reason |
|---------|------|--------|
| Vercel | $0 | Still under free tier limits |
| HF Space | $0 | Free tier handles it |
| **Total** | **$0** | No charges |

#### Scenario 2: 10,000 users/month
| Service | Cost | Reason |
|---------|------|--------|
| Vercel | $0-$5 | Might exceed 100GB bandwidth, overage charges start |
| HF Space | $10 | Switch to paid tier for reliability (48h restart issue) |
| **Total** | **~$10-$15** | Modest increase |

#### Scenario 3: 100,000+ users/month
| Service | Cost | Reason |
|---------|------|--------|
| Vercel | $50-$100 | Bandwidth overages, may need Pro plan ($20/mo) |
| HF Space | $10-$50 | Might need GPU acceleration or dedicated space |
| **Total** | **$60-$150** | Significant increase |

### Cost Optimization Strategies
1. **Enable CDN caching** on HF Space responses
2. **Compress audio files** before upload (reduce bandwidth)
3. **Cache model in-memory** (reduce latency & resource usage)
4. **Implement rate limiting** (prevent abuse)
5. **Use Vercel paid plan** only if bandwidth consistently exceeds free tier

---

## 8. Deployment Pipeline

### Current Setup
```
GitHub (Code Repository)
    ↓ (Push to main branch)
Vercel (Automatic Deployment)
    ↓ (Build: npm run build)
Static Files (dist/cricket-app/browser/)
    ↓ (Deployed globally on Vercel CDN)
Production: https://thai-cricket-ai.vercel.app
```

### Build Process
1. **Trigger**: Push to `main` branch
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist/cricket-app/browser`
4. **Vercel Config**: `Frontend/cricket-app/vercel.json`
   - `buildCommand`: "npm run build"
   - `outputDirectory`: "dist/cricket-app/browser"
5. **Deployment Time**: ~2-3 minutes
6. **Preview**: Automatic preview for pull requests

---

## 9. File Structure

```
Frontend/cricket-app/
├── src/
│   ├── app/
│   │   ├── app.config.ts              (Angular providers, HTTP client setup)
│   │   ├── app.routes.ts              (Router configuration)
│   │   ├── components/
│   │   │   └── cricket-predictor/     (Main prediction UI)
│   │   ├── pages/
│   │   │   └── home/                  (Landing page)
│   │   └── services/
│   │       └── cricket-api.service.ts (API calls to HF Space)
│   ├── styles.css                     (Global styles)
│   └── index.html                     (Root HTML with meta tags)
├── public/
│   ├── robots.txt                     (SEO - search engine crawlers)
│   └── sitemap.xml                    (SEO - site structure)
├── angular.json                       (Angular build config)
├── tsconfig.json                      (TypeScript config)
├── vercel.json                        (Vercel deployment config)
└── package.json                       (Dependencies, scripts)

Backend/cricket-api/
├── cricket-api/
│   └── app.py                         (FastAPI server + ML model)
├── cricket_model.h5                   (TensorFlow/Keras model)
├── requirements.txt                   (Python dependencies)
└── Dockerfile                         (Container for HF Space)
```

---

## 10. Environment Variables

### Vercel (Frontend)
**Public Variables** (visible to browser):
```
VITE_API_URL = https://pasher0-0-cricket-api.hf.space
```

### HF Space (Backend)
**Secret Variables** (protected):
```
API_KEY = [optional, for future authentication]
HF_TOKEN = [HF API token for model downloads]
```

---

## 11. Performance Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Page Load Time | 2-3s | <3s ✅ |
| API Response Time | 1-2s | <2s ✅ |
| Lighthouse Score | ~85 | >80 ✅ |
| Time to Interactive | 3-4s | <4s ✅ |

### Bottlenecks
1. **ML Model Loading**: ~1s (on first request)
2. **Audio Processing**: ~1-2s (depends on file size & complexity)
3. **Network Latency**: ~0.5-1s (Vercel → HF Space)

---

## 12. Monitoring & Maintenance

### Current Monitoring
- ✅ Vercel Analytics (auto-included)
- ✅ GitHub Actions CI/CD logs
- ⚠️ HF Space manual checks needed (no automated monitoring)

### Maintenance Tasks
| Task | Frequency | Status |
|------|-----------|--------|
| Check HF Space uptime | Weekly | Manual ⚠️ |
| Monitor error logs | Weekly | Via Vercel logs |
| Update dependencies | Monthly | Via Dependabot |
| Redeploy HF Space (if paused) | As needed | Manual |

### Recommended Improvements
1. **Add error tracking** (Sentry.io or similar)
2. **Add uptime monitoring** (UptimeRobot.com)
3. **Add API analytics** (LogRocket or custom logging)
4. **Set up alerts** for failures/errors

---

## 13. Future Enhancements

### Phase 1 (Easy - No Cost)
- [ ] Add SEO meta tags & sitemap
- [ ] Implement audio compression
- [ ] Add error handling UI
- [ ] Add loading indicators
- [ ] Dark mode theme

### Phase 2 (Medium - Paid)
- [ ] Add user authentication (HF OAuth)
- [ ] Implement API rate limiting
- [ ] Add persistent user history (database)
- [ ] Multi-language support (i18n)
- [ ] Mobile app (React Native or Flutter)

### Phase 3 (Advanced - Major Cost)
- [ ] Real-time cricket detection (live audio stream)
- [ ] GPS location tracking (map where crickets found)
- [ ] Community contributions (species sightings)
- [ ] API commercialization (paid tier for developers)
- [ ] Dedicated infrastructure (private HF Space, custom domain)

---

## 14. Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | Angular | 19.2.0 |
| **Frontend Build** | Vite/Esbuild | (via Angular CLI) |
| **Frontend Hosting** | Vercel | Free Tier |
| **Styling** | Bootstrap | 5.3.0 |
| **Backend Framework** | FastAPI | Latest |
| **ML Framework** | TensorFlow/Keras | 2.x |
| **Audio Processing** | Librosa | Latest |
| **Backend Hosting** | HF Spaces (Docker) | Free Tier |
| **Repository** | GitHub | Public |
| **CI/CD** | GitHub + Vercel | Automatic |

---

## 15. Compliance & Certifications

- ✅ HTTPS enforced (Vercel + HF Space)
- ✅ No personal data collection (except audio for prediction)
- ⚠️ Privacy Policy needed (if collecting user info)
- ⚠️ Terms of Service needed (if public service)
- ❌ GDPR compliance: Not implemented (no persistent data storage currently)

---

## 16. Quick Reference

### URLs
- **Live App**: https://thai-cricket-ai.vercel.app
- **GitHub Repo**: https://github.com/Pasher0-0/Thai-Cricket-AI
- **Backend API**: https://pasher0-0-cricket-api.hf.space
- **Vercel Dashboard**: https://vercel.com/dashboard
- **HF Spaces**: https://huggingface.co/spaces/Pasher0-0/cricket-api

### Key Commands
```bash
# Local development
npm install
npm start  # ng serve on http://localhost:4200

# Production build
npm run build  # output to dist/cricket-app/browser/

# Deploy (automatic on GitHub push)
git push origin main
```

---

**Last Updated**: May 25, 2026  
**Status**: ✅ Production Ready  
**Maintenance**: Active

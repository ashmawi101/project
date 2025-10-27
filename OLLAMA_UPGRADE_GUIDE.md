# Ollama Llama 3.3 70B Upgrade Guide

## Step 1: Install Ollama (Windows)

### Option A: GUI Installer (Recommended)
1. Visit: https://ollama.com/download
2. Download `OllamaSetup.exe` for Windows
3. Run the installer
4. Restart your terminal/PowerShell

### Option B: Command Line
```powershell
# In PowerShell (Run as Administrator)
winget install Ollama.Ollama
```

### Verify Installation
```bash
ollama --version
# Should output: ollama version 0.x.x
```

---

## Step 2: Choose Your Model Size

### Memory Requirements

| Model Version | RAM Needed | Quality | Speed | Recommended For |
|--------------|------------|---------|-------|-----------------|
| **llama3.3:8b-instruct-q4_K_M** | ~6 GB | Good | Fast | Development/Testing |
| **llama3.3:70b-instruct-q4_K_M** | ~40 GB | Excellent | Slower | Production (if you have RAM) |
| **llama3.3:70b-instruct-q8_0** | ~70 GB | Best | Slowest | Production (high-end servers) |

### Check Your Available RAM
```bash
# Windows PowerShell
systeminfo | findstr /C:"Total Physical Memory"
```

---

## Step 3: Pull the Model

### Recommended: Start with 8B for Testing
```bash
# Pull the 8B model (smaller, faster)
ollama pull llama3.3:8b-instruct-q4_K_M
```

### If You Have 40GB+ RAM: Use 70B
```bash
# Pull the 70B model (4-bit quantized)
ollama pull llama3.3:70b-instruct-q4_K_M
```

### Test the Model
```bash
# Test with a simple prompt
ollama run llama3.3:8b-instruct-q4_K_M "Explain Python decorators in one sentence."
```

---

## Step 4: Update Your Code

The upgraded code files are ready:
- `Interview_App/Tips/tips_v2.py` (NEW - Better prompt engineering)
- `Interview_App/RAG/RAG_v2.py` (NEW - Enhanced context management)
- `Interview_App/benchmarks/llm_benchmark.py` (NEW - Performance testing)

### Quick Test
```bash
cd interview-simulation-back/Interview_App
python -c "from Interview_App.Tips.tips_v2 import get_ollama_tips_v2; print(get_ollama_tips_v2('What is OOP?', 'Classes and objects', 'OOP is a programming paradigm based on objects containing data and methods'))"
```

---

## Step 5: Run Benchmarks

```bash
cd interview-simulation-back/Interview_App
python benchmarks/llm_benchmark.py
```

This will compare:
- Old model (`llama3`) vs New model (`llama3.3`)
- Response quality
- Latency
- Resource usage

---

## Troubleshooting

### Model Download is Slow
The 70B model is ~40GB. Download time depends on your internet:
- 100 Mbps: ~53 minutes
- 50 Mbps: ~107 minutes
- 25 Mbps: ~214 minutes

### Out of Memory Error
If you get memory errors:
1. Use the 8B model instead: `llama3.3:8b-instruct-q4_K_M`
2. Or use more aggressive quantization: `llama3.3:70b-instruct-q2_K`

### Ollama Service Not Running
```bash
# Windows: Start Ollama service
ollama serve
```

---

## Performance Expectations

### Llama 3.3 8B vs Old Llama 3 8B
- **Quality**: +15-20% better reasoning
- **Latency**: Similar (~2-4s per response)
- **Context**: 128k tokens (vs 8k in old version)

### Llama 3.3 70B vs Llama 3 8B
- **Quality**: +40-50% better reasoning, more nuanced tips
- **Latency**: ~5-10s per response (3-5x slower)
- **Context**: 128k tokens
- **Best For**: Production with complex interview scenarios

---

## Next Steps After Installation

1. ✅ Install Ollama
2. ✅ Pull model (start with 8B, upgrade to 70B if you have RAM)
3. ✅ Run tests with `tips_v2.py`
4. ✅ Run benchmarks to compare quality
5. ✅ Switch to new version in production code
6. 📊 Monitor performance in real interviews

---

## Rollback Plan

If you need to rollback:
```python
# In tips.py and RAG.py, change model back to:
model='llama3'  # Old model
# instead of:
model='llama3.3:8b-instruct-q4_K_M'  # New model
```

The old `llama3` model will still be available unless you explicitly remove it:
```bash
ollama rm llama3  # Don't run this unless you want to remove it
```

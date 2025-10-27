# AI Model Upgrade Plan - Interview Simulation Platform

## Current State Analysis

### 1. LLM (Tips & RAG)
**Current**: Ollama with `llama3` (8B, older version)
- **Files**: `Tips/tips.py`, `RAG/RAG.py`
- **Usage**: Generating improvement tips, follow-up questions
- **Issues**: Outdated model, potentially lower quality outputs

**Target**: Llama 3.3 70B (quantized)
- **Expected Improvement**: 30-40% better reasoning, more contextual tips
- **Quantization**: 4-bit or 8-bit for memory efficiency

---

### 2. Speech-to-Text
**Current**: `whisper_timestamped` with `base.en` model
- **File**: `Filler_STT/filler_STT.py`
- **WER**: ~8-10% (estimated)
- **Filler Detection**: Basic via disfluencies flag

**Target Options**:
- **Whisper V3 Turbo**: Faster, lower WER (~5-6%)
- **Canary Qwen**: Multilingual, potentially better accuracy
- **WhisperD**: Specialized for disfluency detection

---

### 3. Answer Scoring
**Current**: spaCy `en_core_web_md` + commented out `paraphrase-MiniLM-L6-v2`
- **File**: `Answer_Score/scoring_v6.py`
- **Method**: Keyword matching + basic semantic similarity
- **Issues**:
  - SentenceTransformer model commented out (lines 1, 9-10, 74, 81-82)
  - Model not actually loaded causing errors
  - Simple keyword matching may miss semantic equivalence

**Target**: Modern semantic similarity approach
- **all-MiniLM-L6-v2** or **BAAI/bge-small-en-v1.5**
- Hybrid scoring: semantic (60%) + keyword (20%) + structure (20%)
- Confidence thresholds for human review

---

### 4. Audio Emotion Recognition
**Current**: ModelScope `emotion2vec_base_finetuned`
- **File**: `Audio_Emotion/model2.py`
- **Classes**: 8 emotions (neutral, calm, happy, sad, angry, fearful, disgust, surprised)
- **Status**: Relatively modern (2023-2024)

**Target**: Keep current OR upgrade to:
- **emotion2vec_plus_large** (if need higher accuracy)
- **MobileNetV2** (if need video emotion via facial expressions)

---

### 5. Text Emotion Recognition
**Current**: `SamLowe/roberta-base-go_emotions`
- **File**: `Text_Emotion/Predict.py`
- **Classes**: 27 detailed emotions → 8 broad emotions
- **Status**: Good quality, trained on GoEmotions dataset

**Target**: Keep current OR upgrade to:
- **bhadresh-savani/distilbert-base-uncased-emotion** (faster)
- **j-hartmann/emotion-english-distilroberta-base** (better accuracy)

---

### 6. Job Recommendations
**Current**: Basic `CountVectorizer` + cosine similarity
- **File**: `Recommendation/recommendation.py`
- **Method**: Simple bag-of-words matching
- **Issues**: No semantic understanding, exact skill name matching only

**Target**: BERT-based embeddings
- **all-MiniLM-L6-v2** or **BAAI/bge-base-en-v1.5**
- Semantic skill matching
- Skill gap analysis with explanations

---

## Phase 1: Core Model Upgrades (Weeks 1-3)

### Week 1: LLM Upgrade

#### Task 1.1: Install Ollama with Llama 3.3 70B
```bash
# Install Ollama (if not already)
curl -fsSL https://ollama.com/install.sh | sh

# Pull Llama 3.3 70B (4-bit quantized for memory efficiency)
ollama pull llama3.3:70b-instruct-q4_K_M

# Alternative: 8-bit version (higher quality, more memory)
ollama pull llama3.3:70b-instruct-q8_0

# Test the model
ollama run llama3.3:70b-instruct-q4_K_M "Evaluate this interview answer..."
```

**Memory Requirements**:
- 4-bit: ~40GB RAM
- 8-bit: ~70GB RAM
- Consider using smaller 8B version if memory constrained: `ollama pull llama3.3:8b-instruct-q4_K_M`

#### Task 1.2: Update LLM Code
**Files to modify**: `Tips/tips.py`, `RAG/RAG.py`

```python
# tips.py - Update model name
response = ollama.chat(model='llama3.3:70b-instruct-q4_K_M', messages=[...])

# Add better prompt engineering
prompt = f"""
You are an expert interview coach. Analyze this interview response.

Question: {question}
Candidate's Answer: {interviewee_answer}
Expected Answer: {company_desired_answer}

Provide a constructive tip (50-100 words) that:
1. Identifies specific gaps in technical knowledge or communication
2. Suggests concrete improvements
3. Uses the same technical terminology as the expected answer
4. Focuses on actionable advice

Tip:"""
```

#### Task 1.3: Benchmark LLM Performance
Create benchmarking script:

```python
# Interview_App/benchmarks/llm_benchmark.py
import time
import ollama

test_cases = [
    {
        "question": "What is polymorphism?",
        "user_answer": "It's when code can work with different types",
        "expected_answer": "Polymorphism is the ability of objects to take multiple forms..."
    },
    # Add 20-30 test cases
]

def benchmark_model(model_name):
    results = []
    for case in test_cases:
        start = time.time()
        response = ollama.chat(model=model_name, messages=[...])
        latency = time.time() - start
        results.append({
            "latency": latency,
            "response": response['message']['content'],
            "quality_score": human_evaluate(response)  # Manual scoring
        })
    return results

# Compare old vs new
old_results = benchmark_model('llama3')
new_results = benchmark_model('llama3.3:70b-instruct-q4_K_M')
```

**Metrics to track**:
- Average latency (target: <5s for tips, <8s for follow-ups)
- Tip quality score (1-5 scale, manual evaluation)
- Resource usage (CPU, RAM, GPU if available)

---

### Week 2: Speech-to-Text Upgrade

#### Task 2.1: Evaluate Whisper V3 Turbo

```bash
pip install faster-whisper transformers
```

```python
# Interview_App/benchmarks/stt_benchmark.py
from faster_whisper import WhisperModel
import whisper_timestamped as whisper
import time

# Load models
whisper_v3_turbo = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8")
current_model = whisper.load_model("base.en", device="cpu")

def benchmark_stt(audio_path):
    # Test Whisper V3 Turbo
    start = time.time()
    segments, info = whisper_v3_turbo.transcribe(audio_path, beam_size=5)
    v3_time = time.time() - start
    v3_text = " ".join([segment.text for segment in segments])

    # Test current model
    start = time.time()
    audio = whisper.load_audio(audio_path)
    result = whisper.transcribe(current_model, audio, language="en")
    current_time = time.time() - start
    current_text = result['text']

    return {
        "v3_turbo": {"text": v3_text, "time": v3_time},
        "current": {"text": current_text, "time": current_time}
    }
```

**Evaluation metrics**:
- WER (Word Error Rate) - compare against ground truth transcripts
- Processing time per minute of audio
- Accuracy on different accents/noise levels

#### Task 2.2: Implement WhisperD for Filler Detection

**Option A**: Use specialized filler detection model
```bash
pip install whisperd
```

**Option B**: Enhance current approach with better filler word list
```python
# Filler_STT/filler_STT_v2.py
import whisper_timestamped as whisper
import re

FILLER_WORDS = [
    'um', 'uh', 'er', 'ah', 'like', 'you know', 'sort of',
    'kind of', 'basically', 'actually', 'literally', 'right',
    'so', 'well', 'I mean', 'anyway'
]

def advanced_filler_detection(audio_path):
    audio = whisper.load_audio(audio_path)
    model = whisper.load_model("large-v3-turbo", device="cpu")
    result = whisper.transcribe(model, audio, language="en", detect_disfluencies=True)

    filler_words = []
    text_words = []

    for segment in result["segments"]:
        for word in segment["words"]:
            # Detect timestamped fillers
            if "[*]" in word["text"]:
                filler_words.append({
                    "word": word["text"],
                    "start": word["start"],
                    "end": word["end"],
                    "type": "disfluency"
                })
            # Detect common filler words
            word_clean = word["text"].strip().lower()
            if word_clean in FILLER_WORDS:
                filler_words.append({
                    "word": word_clean,
                    "start": word["start"],
                    "end": word["end"],
                    "type": "filler"
                })
            text_words.append(word["text"])

    # Calculate filler rate
    total_words = len(text_words)
    filler_rate = len(filler_words) / total_words if total_words > 0 else 0

    return {
        "text": " ".join(text_words),
        "filler_count": len(filler_words),
        "filler_rate": filler_rate,
        "filler_details": filler_words
    }
```

---

### Week 3: Emotion Model Upgrades

#### Task 3.1: Evaluate Audio Emotion Models

Current model is actually quite modern. Consider upgrading only if needed:

```python
# Audio_Emotion/model_comparison.py
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

# Current model
current_model = pipeline(
    task=Tasks.emotion_recognition,
    model="iic/emotion2vec_base_finetuned"
)

# Larger model for comparison
large_model = pipeline(
    task=Tasks.emotion_recognition,
    model="iic/emotion2vec_plus_large"
)

def benchmark_audio_emotion(audio_path):
    # Test both models
    current_result = current_model(audio_path, granularity="utterance")[0]
    large_result = large_model(audio_path, granularity="utterance")[0]

    return {
        "current": current_result,
        "large": large_result
    }
```

**Decision criteria**: Only upgrade if large model shows >10% accuracy improvement on test set.

#### Task 3.2: Upgrade Text Emotion Model

```python
# Text_Emotion/Predict_v2.py
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch

class TextEmotionV2:
    def __init__(self):
        # Option 1: Keep current (good quality)
        self.model_name = "SamLowe/roberta-base-go_emotions"

        # Option 2: Faster alternative
        # self.model_name = "bhadresh-savani/distilbert-base-uncased-emotion"

        # Option 3: Higher accuracy
        # self.model_name = "j-hartmann/emotion-english-distilroberta-base"

        self.classifier = pipeline(
            task="text-classification",
            model=self.model_name,
            top_k=None,
            device=0 if torch.cuda.is_available() else -1
        )

    def predict(self, text):
        results = self.classifier(text)[0]
        # Return top emotion with confidence
        top_emotion = max(results, key=lambda x: x['score'])
        return {
            "emotion": top_emotion['label'],
            "confidence": top_emotion['score'],
            "all_scores": results
        }
```

---

## Phase 2: Algorithm Enhancement (Weeks 4-5)

### Week 4: Answer Scoring & RAG

#### Task 4.1: Fix and Upgrade Answer Scoring

**Critical Fix**: The current `scoring_v6.py` has commented-out SentenceTransformer code causing errors!

```python
# Answer_Score/scoring_v7.py
from sentence_transformers import SentenceTransformer, util
import spacy
from textblob import TextBlob
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import wordnet as wn

# Load models globally (singleton pattern for efficiency)
SEMANTIC_MODEL = SentenceTransformer('BAAI/bge-small-en-v1.5')
NLP_MODEL = spacy.load("en_core_web_md")

def score_response_v7(reference_answer, user_response):
    """
    Hybrid scoring with semantic similarity, keyword matching, and structure analysis.

    Returns: dict with score and breakdown
    """
    # 1. Semantic Similarity (60% weight)
    ref_embedding = SEMANTIC_MODEL.encode(reference_answer, convert_to_tensor=True)
    user_embedding = SEMANTIC_MODEL.encode(user_response, convert_to_tensor=True)
    semantic_score = util.pytorch_cos_sim(ref_embedding, user_embedding)[0][0].item()

    # 2. Keyword Matching (20% weight)
    ref_keywords = extract_keywords(reference_answer, NLP_MODEL)
    user_keywords = extract_keywords(user_response, NLP_MODEL)
    keyword_score = len(set(ref_keywords) & set(user_keywords)) / len(ref_keywords) if ref_keywords else 0

    # 3. Structure Analysis (20% weight)
    structure_score = analyze_structure(reference_answer, user_response)

    # 4. Penalties
    negation_penalty = 0.2 if detect_negation(user_response) else 0
    antonym_penalty = 0.2 if detect_antonyms(user_response, ref_keywords) else 0

    # Calculate final score
    combined_score = (
        (semantic_score * 0.6) +
        (keyword_score * 0.2) +
        (structure_score * 0.2) -
        negation_penalty -
        antonym_penalty
    )

    final_score = max(0, min(100, combined_score * 100))

    # Confidence threshold for human review
    needs_review = (
        semantic_score < 0.5 or  # Low semantic match
        abs(len(user_response) - len(reference_answer)) / len(reference_answer) > 2  # Length mismatch
    )

    return {
        "score": final_score,
        "breakdown": {
            "semantic": semantic_score * 100,
            "keywords": keyword_score * 100,
            "structure": structure_score * 100,
            "penalties": (negation_penalty + antonym_penalty) * 100
        },
        "needs_review": needs_review,
        "confidence": "high" if semantic_score > 0.7 else "medium" if semantic_score > 0.5 else "low"
    }

def analyze_structure(reference, response):
    """Analyze answer structure similarity."""
    ref_doc = NLP_MODEL(reference)
    resp_doc = NLP_MODEL(response)

    # Compare sentence structures
    ref_sentences = list(ref_doc.sents)
    resp_sentences = list(resp_doc.sents)

    # Penalize very short or very long answers
    length_ratio = len(resp_sentences) / len(ref_sentences) if ref_sentences else 0
    length_score = 1.0 - min(abs(1 - length_ratio), 1.0)

    return length_score

def extract_keywords(text, nlp):
    """Enhanced keyword extraction."""
    doc = nlp(text)
    keywords = set()

    # Noun chunks
    for chunk in doc.noun_chunks:
        keywords.add(chunk.text.lower())

    # Named entities
    for ent in doc.ents:
        keywords.add(ent.text.lower())

    # Important POS tags
    for token in doc:
        if token.pos_ in {'NOUN', 'PROPN', 'VERB'} and not token.is_stop:
            keywords.add(token.lemma_.lower())

    return list(keywords)

# Keep existing negation and antonym detection functions...
```

#### Task 4.2: Upgrade RAG Embeddings

```python
# RAG/RAG_v2.py
import ollama
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict

# Load better embedding model
EMBEDDING_MODEL = SentenceTransformer('BAAI/bge-large-en-v1.5')

def get_follow_up_question_v2(
    past_questions_answers: List[Dict],
    last_question: str,
    last_answer: str,
    context_window: int = 3
):
    """
    Enhanced RAG with better embeddings and context management.
    """
    # 1. Select most relevant context (last N Q&As)
    relevant_context = past_questions_answers[-context_window:] if len(past_questions_answers) > context_window else past_questions_answers

    # 2. Embed questions to find semantic patterns
    if len(relevant_context) > 0:
        question_texts = [qa['question__question_text'] for qa in relevant_context]
        question_embeddings = EMBEDDING_MODEL.encode(question_texts)
        last_q_embedding = EMBEDDING_MODEL.encode(last_question)

        # Calculate similarity to avoid redundant questions
        similarities = np.dot(question_embeddings, last_q_embedding) / (
            np.linalg.norm(question_embeddings, axis=1) * np.linalg.norm(last_q_embedding)
        )

        # If very similar question already asked, skip follow-up
        if np.max(similarities) > 0.85:
            return "No Need!"

    # 3. Create enhanced prompt with better context
    past_qa_formatted = "\n".join([
        f"{i}. Q: {qa['question__question_text']}\n   A: {qa['response_text']}"
        for i, qa in enumerate(relevant_context, start=1)
    ])

    prompt = f"""
You are an expert interviewer. Based on the interview conversation, determine if a follow-up question is needed.

Interview Context:
{past_qa_formatted}

Latest Exchange:
Question: {last_question}
Answer: {last_answer}

Analysis Guidelines:
1. Only generate a follow-up if the answer is incomplete, vague, or reveals interesting points to explore
2. The follow-up should dig deeper into technical details or practical application
3. Avoid redundant questions already covered in the interview
4. Make it conversational and natural

If NO follow-up is needed, respond with EXACTLY: "No Need!"

If a follow-up IS needed, respond in this EXACT format:
Question: [Your follow-up question]
Answer: [Expected good answer]

Response:"""

    response = ollama.chat(
        model='llama3.3:70b-instruct-q4_K_M',
        messages=[{'role': 'user', 'content': prompt}]
    )

    response_content = response['message']['content'].strip()
    return response_content

def evaluate_rag_quality(test_cases: List[Dict]):
    """
    Evaluate RAG system quality.

    Metrics:
    - Answer relevancy: How relevant is the follow-up to the context?
    - Retrieval accuracy: Does it use the right context?
    - Question quality: Is the follow-up meaningful?
    """
    results = []
    for case in test_cases:
        follow_up = get_follow_up_question_v2(
            case['past_qa'],
            case['last_question'],
            case['last_answer']
        )

        # Manual or automated evaluation
        results.append({
            "follow_up": follow_up,
            "expected_to_ask": case['should_ask_followup'],
            "quality_score": rate_question_quality(follow_up)  # 1-5 scale
        })

    return results
```

---

### Week 5: Job Recommendations

#### Task 5.1: BERT-based Job Matching

```python
# Recommendation/recommendation_v2.py
from sentence_transformers import SentenceTransformer
import numpy as np
import pandas as pd
from typing import List, Dict

class SemanticJobMatcher:
    def __init__(self):
        self.model = SentenceTransformer('BAAI/bge-base-en-v1.5')

    def match_jobs(
        self,
        jobs_df: pd.DataFrame,
        user_skills: List[str],
        top_k: int = 10
    ) -> pd.DataFrame:
        """
        Match jobs using semantic embeddings instead of exact keyword matching.
        """
        # Embed user skills
        user_skills_text = ", ".join(user_skills)
        user_embedding = self.model.encode(user_skills_text)

        # Embed job requirements
        job_embeddings = []
        for _, job in jobs_df.iterrows():
            job_skills_text = ", ".join(job['requirement_skills'])
            job_embedding = self.model.encode(job_skills_text)
            job_embeddings.append(job_embedding)

        job_embeddings = np.array(job_embeddings)

        # Calculate cosine similarity
        similarities = np.dot(job_embeddings, user_embedding) / (
            np.linalg.norm(job_embeddings, axis=1) * np.linalg.norm(user_embedding)
        )

        # Add similarity scores
        jobs_df['semantic_match_score'] = similarities

        # Analyze skill gaps
        jobs_df['skill_gap_analysis'] = jobs_df.apply(
            lambda row: self.analyze_skill_gap(user_skills, row['requirement_skills']),
            axis=1
        )

        # Sort by similarity
        jobs_df = jobs_df.sort_values('semantic_match_score', ascending=False)

        return jobs_df.head(top_k)

    def analyze_skill_gap(
        self,
        user_skills: List[str],
        job_requirements: List[str]
    ) -> Dict:
        """
        Provide detailed skill gap analysis.
        """
        user_set = set([s.lower() for s in user_skills])
        req_set = set([s.lower() for s in job_requirements])

        # Direct matches
        matched_skills = user_set & req_set

        # Missing skills (exact)
        missing_skills_exact = req_set - user_set

        # Semantic similarity for "soft matches"
        if len(user_skills) > 0 and len(job_requirements) > 0:
            user_embeddings = self.model.encode(user_skills)
            req_embeddings = self.model.encode(job_requirements)

            # Find semantically similar skills
            similarity_matrix = np.dot(user_embeddings, req_embeddings.T)
            soft_matches = []

            for i, req_skill in enumerate(job_requirements):
                if req_skill.lower() not in user_set:
                    # Find best matching user skill
                    best_match_idx = np.argmax(similarity_matrix[:, i])
                    best_score = similarity_matrix[best_match_idx, i]

                    if best_score > 0.7:  # Threshold for "similar"
                        soft_matches.append({
                            "required": req_skill,
                            "similar_to": user_skills[best_match_idx],
                            "similarity": float(best_score)
                        })
        else:
            soft_matches = []

        return {
            "matched_skills": list(matched_skills),
            "missing_skills": list(missing_skills_exact - set([m['required'].lower() for m in soft_matches])),
            "soft_matches": soft_matches,
            "match_percentage": len(matched_skills) / len(req_set) * 100 if req_set else 0
        }

# Update the API view to use new matcher
def get_job_recommendations_v2(user):
    from .models import UserSkill
    from .recommendation_v2 import SemanticJobMatcher

    user_skills = list(UserSkill.objects.filter(user=user).values_list('skill_name', flat=True))
    jobs_df = get_jobs_dataframe()

    matcher = SemanticJobMatcher()
    recommended_jobs = matcher.match_jobs(jobs_df, user_skills, top_k=10)

    return recommended_jobs
```

---

## Phase 3: Performance Optimization (Week 6)

### Task 6.1: Implement Redis Caching

```bash
pip install redis celery
```

```python
# Interview_App/Interview_App/cache.py
import redis
import json
import hashlib
from typing import Any, Optional
import numpy as np

class ModelCache:
    def __init__(self):
        self.redis_client = redis.Redis(
            host='localhost',
            port=6379,
            db=0,
            decode_responses=False  # Store binary data
        )

    def _generate_key(self, prefix: str, *args) -> str:
        """Generate cache key from arguments."""
        key_data = json.dumps(args, sort_keys=True)
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        return f"{prefix}:{key_hash}"

    def get_embedding(self, text: str, model_name: str) -> Optional[np.ndarray]:
        """Get cached embedding."""
        key = self._generate_key("embedding", model_name, text)
        cached = self.redis_client.get(key)

        if cached:
            return np.frombuffer(cached, dtype=np.float32)
        return None

    def set_embedding(self, text: str, model_name: str, embedding: np.ndarray, ttl: int = 3600):
        """Cache embedding with TTL."""
        key = self._generate_key("embedding", model_name, text)
        self.redis_client.setex(
            key,
            ttl,
            embedding.astype(np.float32).tobytes()
        )

    def get_llm_response(self, prompt: str, model_name: str) -> Optional[str]:
        """Get cached LLM response."""
        key = self._generate_key("llm", model_name, prompt)
        cached = self.redis_client.get(key)

        if cached:
            return cached.decode('utf-8')
        return None

    def set_llm_response(self, prompt: str, model_name: str, response: str, ttl: int = 86400):
        """Cache LLM response with TTL (24 hours default)."""
        key = self._generate_key("llm", model_name, prompt)
        self.redis_client.setex(key, ttl, response.encode('utf-8'))

# Usage in scoring_v7.py
cache = ModelCache()

def score_response_cached(reference_answer, user_response):
    # Try cache first
    cache_key = f"{reference_answer}::{user_response}"
    cached_score = cache.redis_client.get(f"score:{hashlib.md5(cache_key.encode()).hexdigest()}")

    if cached_score:
        return json.loads(cached_score)

    # Compute if not cached
    result = score_response_v7(reference_answer, user_response)

    # Cache for 1 hour
    cache.redis_client.setex(
        f"score:{hashlib.md5(cache_key.encode()).hexdigest()}",
        3600,
        json.dumps(result)
    )

    return result
```

### Task 6.2: Celery Async Processing

```python
# Interview_App/Interview_App/celery.py
from celery import Celery
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Interview_App.settings')

app = Celery('Interview_App')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Interview_App/Interview_App/tasks.py
from celery import shared_task
from .Audio_Emotion.model2 import audio_predict
from .Text_Emotion.Predict import Text_Emotion
from .Answer_Score.scoring_v7 import score_response_v7
from .Tips.tips import get_ollama_tips
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_audio_emotion(self, audio_file_path):
    """Process audio emotion in background."""
    try:
        emotion = audio_predict(audio_file_path)
        return {"emotion": emotion, "status": "success"}
    except Exception as e:
        logger.error(f"Audio emotion task failed: {e}")
        raise self.retry(exc=e)

@shared_task(bind=True, max_retries=3)
def process_text_emotion(self, text):
    """Process text emotion in background."""
    try:
        emotion = Text_Emotion(text)
        return {"emotion": emotion, "status": "success"}
    except Exception as e:
        logger.error(f"Text emotion task failed: {e}")
        raise self.retry(exc=e)

@shared_task(bind=True, max_retries=2, time_limit=300)
def generate_tips(self, question, user_answer, expected_answer):
    """Generate tips in background (can be slow)."""
    try:
        tips = get_ollama_tips(question, user_answer, expected_answer)
        return {"tips": tips, "status": "success"}
    except Exception as e:
        logger.error(f"Tips generation failed: {e}")
        raise self.retry(exc=e)

@shared_task(bind=True, max_retries=3)
def score_answer(self, reference_answer, user_response):
    """Score answer in background."""
    try:
        score = score_response_v7(reference_answer, user_response)
        return score
    except Exception as e:
        logger.error(f"Answer scoring failed: {e}")
        raise self.retry(exc=e)

# Update api.py to use async tasks
from .tasks import process_audio_emotion, process_text_emotion, generate_tips, score_answer

def _predict_and_score_text(self, user, response, question_instance, interview):
    # Launch async tasks
    text_emotion_task = process_text_emotion.delay(response.response_text)

    if question_instance.answer:
        score_task = score_answer.delay(question_instance.answer, response.response_text)

        # Get result (with timeout)
        try:
            scoring_result = score_task.get(timeout=30)

            if scoring_result['score'] <= 50:
                # Generate tips asynchronously (don't wait)
                generate_tips.delay(
                    question_instance.question_text,
                    response.response_text,
                    question_instance.answer
                )
        except Exception as e:
            logger.error(f"Scoring task failed: {e}")
```

### Task 6.3: Performance Monitoring

```python
# Interview_App/Interview_App/monitoring.py
import time
import logging
from functools import wraps
from typing import Callable
import psutil
import GPUtil

logger = logging.getLogger(__name__)

class PerformanceMonitor:
    def __init__(self):
        self.metrics = {
            "llm_calls": [],
            "embedding_calls": [],
            "emotion_calls": [],
            "scoring_calls": []
        }

    def track_inference(self, model_type: str):
        """Decorator to track model inference time and resources."""
        def decorator(func: Callable):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Track start time and resources
                start_time = time.time()
                start_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB

                try:
                    # Get GPU info if available
                    gpus = GPUtil.getGPUs()
                    start_gpu_mem = gpus[0].memoryUsed if gpus else 0
                except:
                    start_gpu_mem = 0

                # Execute function
                result = func(*args, **kwargs)

                # Track end time and resources
                end_time = time.time()
                end_memory = psutil.Process().memory_info().rss / 1024 / 1024

                try:
                    gpus = GPUtil.getGPUs()
                    end_gpu_mem = gpus[0].memoryUsed if gpus else 0
                except:
                    end_gpu_mem = 0

                # Log metrics
                metrics = {
                    "model_type": model_type,
                    "function": func.__name__,
                    "latency": end_time - start_time,
                    "memory_delta": end_memory - start_memory,
                    "gpu_memory_delta": end_gpu_mem - start_gpu_mem,
                    "timestamp": time.time()
                }

                self.metrics[f"{model_type}_calls"].append(metrics)

                # Alert if performance degrades
                if metrics["latency"] > self._get_threshold(model_type):
                    logger.warning(
                        f"Performance degradation detected: {model_type} took {metrics['latency']:.2f}s"
                    )

                return result

            return wrapper
        return decorator

    def _get_threshold(self, model_type: str) -> float:
        """Get latency threshold for alerting."""
        thresholds = {
            "llm": 10.0,  # 10 seconds
            "embedding": 1.0,  # 1 second
            "emotion": 5.0,  # 5 seconds
            "scoring": 3.0  # 3 seconds
        }
        return thresholds.get(model_type, 5.0)

    def get_stats(self, model_type: str):
        """Get performance statistics."""
        calls = self.metrics.get(f"{model_type}_calls", [])

        if not calls:
            return None

        latencies = [c["latency"] for c in calls]

        return {
            "count": len(calls),
            "avg_latency": sum(latencies) / len(latencies),
            "min_latency": min(latencies),
            "max_latency": max(latencies),
            "p95_latency": sorted(latencies)[int(len(latencies) * 0.95)] if len(latencies) > 0 else 0
        }

# Usage
monitor = PerformanceMonitor()

@monitor.track_inference("llm")
def get_ollama_tips_monitored(question, interviewee_answer, company_desired_answer):
    return get_ollama_tips(question, interviewee_answer, company_desired_answer)
```

---

## Benchmarking & Testing Strategy

### Create Test Datasets

1. **LLM Evaluation**:
   - 30 question-answer pairs with ground truth tips
   - Manual quality scoring (1-5 scale)
   - Compare old vs new model

2. **STT Evaluation**:
   - 50 audio samples with transcripts
   - Diverse accents, noise levels
   - Calculate WER, filler F1 score

3. **Emotion Evaluation**:
   - 100 labeled audio/text samples
   - Calculate accuracy, precision, recall per emotion

4. **Scoring Evaluation**:
   - 200 answer pairs with human scores
   - Calculate correlation coefficient
   - Measure false positive rate

5. **RAG Evaluation**:
   - 50 interview scenarios
   - Measure answer relevancy, retrieval accuracy

6. **Job Matching Evaluation**:
   - User profiles with known good matches
   - Calculate precision@k, MRR

---

## Dependencies Update

```bash
# requirements_upgraded.txt
# Core
Django==5.0.4
djangorestframework==3.15.1
djangorestframework-simplejwt==5.3.1

# LLM
ollama==0.2.1  # Keep current

# Speech-to-Text
faster-whisper==1.0.0  # NEW: For Whisper V3 Turbo
# OR
# openai-whisper==20231117  # Keep if staying with current
whisper-timestamped==1.15.4

# Embeddings & NLP
sentence-transformers==3.0.1  # UPGRADED from commented version
transformers==4.41.2
spacy==3.7.5

# Emotion Recognition
# Audio - Keep current ModelScope
modelscope==1.17.0
# Text - Keep current or upgrade
# NEW: Optional alternatives commented
# bhadresh-savani/distilbert-base-uncased-emotion
# j-hartmann/emotion-english-distilroberta-base

# Caching & Async
redis==5.0.1  # NEW
celery==5.3.4  # NEW
celery[redis]==5.3.4  # NEW

# Monitoring
psutil==5.9.8
gputil==1.4.0  # NEW

# Existing ML dependencies
torch==2.4.0
scikit-learn==1.4.2
numpy==1.26.4
pandas==2.2.2
```

---

## Timeline Summary

### Week 1: LLM Upgrade
- Days 1-2: Install Ollama 3.3 70B, update code
- Days 3-4: Create benchmarks, run comparisons
- Day 5: Analyze results, document improvements

### Week 2: STT Upgrade
- Days 1-2: Evaluate Whisper V3 Turbo vs current
- Days 3-4: Implement enhanced filler detection
- Day 5: Benchmark on test dataset

### Week 3: Emotion Models
- Days 1-2: Evaluate audio emotion models
- Days 3-4: Test text emotion alternatives
- Day 5: Select and deploy best models

### Week 4: Scoring & RAG
- Days 1-2: Fix and upgrade answer scoring
- Days 3-4: Upgrade RAG with better embeddings
- Day 5: Benchmark improvements

### Week 5: Job Matching
- Days 1-3: Implement BERT-based matching
- Day 4: Add skill gap analysis
- Day 5: Test and refine

### Week 6: Optimization
- Days 1-2: Implement Redis caching
- Days 3-4: Set up Celery async processing
- Day 5: Add monitoring and alerts

---

## Risk Mitigation

1. **Memory Issues with Llama 3.3 70B**:
   - Fallback to 8B version if needed
   - Use 4-bit quantization
   - Consider cloud deployment

2. **Performance Degradation**:
   - Implement caching early
   - Use async processing for heavy tasks
   - Monitor latency continuously

3. **Accuracy Not Improving**:
   - Have rollback plan for each component
   - Test thoroughly on representative data
   - Keep old models available

4. **Integration Issues**:
   - Upgrade one component at a time
   - Maintain backward compatibility
   - Version all model outputs

---

## Success Metrics

Track these KPIs throughout the upgrade:

| Metric | Current | Target | Phase |
|--------|---------|--------|-------|
| LLM Tip Quality | 3.2/5 | 4.5/5 | 1 |
| STT WER | ~10% | <6% | 1 |
| Emotion Accuracy | ~75% | >85% | 1 |
| Answer Scoring Correlation | 0.6 | >0.8 | 2 |
| RAG Relevancy | ~70% | >85% | 2 |
| Job Match Precision@10 | ~40% | >70% | 2 |
| Average Inference Time | ~8s | <5s | 3 |
| Cache Hit Rate | 0% | >40% | 3 |

---

## Next Steps

1. Review this plan and adjust priorities
2. Set up development environment
3. Start with Week 1: LLM upgrade
4. Document all changes and benchmarks
5. Iterate based on results

Ready to begin? Let me know which phase you'd like to start with!

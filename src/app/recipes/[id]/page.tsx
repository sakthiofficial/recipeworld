'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, Heart, Bookmark, ChefHat, ArrowLeft, Play, X, Check, Sparkles, SkipForward, SkipBack, CheckCircle, Timer, Volume2, VolumeX } from 'lucide-react';
import { useGetRecipeByIdQuery } from '@/features/recipes/recipeApi';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '@/components/LoginModal';
import { getRecipeImageOrBackground } from '@/utils/recipeImageUtils';

export default function RecipeDetailPage() {
  const params = useParams();
  const recipeId = params.id as string;
  const { user } = useAuth();
  
  const { data: recipe, isLoading, error } = useGetRecipeByIdQuery(recipeId);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'like' | 'follow' | 'save' | null>(null);
  
  // Cooking Mode States
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const [cookingTimer, setCookingTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [chefMessage, setChefMessage] = useState("Ready to cook? Let's make something delicious together!");
  const [showChefTip, setShowChefTip] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [includeInstructions, setIncludeInstructions] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ta' | 'te'>('en');

  // Initialize likes count and check user's like/follow status when recipe loads
  useEffect(() => {
    if (recipe) {
      setLikesCount(recipe.likes || 0);
      
      if (user) {
        const likedRecipes = JSON.parse(localStorage.getItem(`likedRecipes_${user.id}`) || '[]');
        setIsLiked(likedRecipes.includes(recipeId));
        
        const savedRecipes = JSON.parse(localStorage.getItem(`savedRecipes_${user.id}`) || '[]');
        setIsSaved(savedRecipes.includes(recipeId));
        
        const followingUsers = JSON.parse(localStorage.getItem(`following_${user.id}`) || '[]');
        setIsFollowing(followingUsers.includes(recipe.author?._id || recipe.author?.id));
      }
    }
  }, [recipe, user, recipeId]);

  // Load speech synthesis voices
  useEffect(() => {
    if (window.speechSynthesis) {
      // Load voices
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleLike = async () => {
    if (!user) {
      setPendingAction('like');
      setShowLoginModal(true);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token || token.trim() === '') {
        console.error('No valid token found, redirecting to login');
        setPendingAction('like');
        setShowLoginModal(true);
        return;
      }

      const method = isLiked ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/recipes/${recipeId}/like`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
        
        const likedRecipes = JSON.parse(localStorage.getItem(`likedRecipes_${user.id}`) || '[]');
        if (newLikedState) {
          if (!likedRecipes.includes(recipeId)) {
            likedRecipes.push(recipeId);
          }
        } else {
          const index = likedRecipes.indexOf(recipeId);
          if (index > -1) likedRecipes.splice(index, 1);
        }
        localStorage.setItem(`likedRecipes_${user.id}`, JSON.stringify(likedRecipes));
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('Failed to update like:', response.status, errorData);
        
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setPendingAction('like');
          setShowLoginModal(true);
        }
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      setPendingAction('follow');
      setShowLoginModal(true);
      return;
    }

    const authorId = recipe?.author?._id || recipe?.author?.id;
    if (!authorId) {
      alert('Author information not available');
      return;
    }

    if (authorId === user.id) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token || token.trim() === '') {
        console.error('No valid token found, redirecting to login');
        setPendingAction('follow');
        setShowLoginModal(true);
        return;
      }

      const method = isFollowing ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/users/${authorId}/follow`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const newFollowState = !isFollowing;
        setIsFollowing(newFollowState);
        
        const followingUsers = JSON.parse(localStorage.getItem(`following_${user.id}`) || '[]');
        if (newFollowState) {
          if (!followingUsers.includes(authorId)) {
            followingUsers.push(authorId);
          }
        } else {
          const index = followingUsers.indexOf(authorId);
          if (index > -1) followingUsers.splice(index, 1);
        }
        localStorage.setItem(`following_${user.id}`, JSON.stringify(followingUsers));
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('Failed to update follow status:', response.status, errorData);
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setPendingAction('follow');
          setShowLoginModal(true);
        }
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const handleSave = () => {
    if (!user) {
      setPendingAction('save');
      setShowLoginModal(true);
      return;
    }

    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    
    const savedRecipes = JSON.parse(localStorage.getItem(`savedRecipes_${user.id}`) || '[]');
    if (newSavedState) {
      if (!savedRecipes.includes(recipeId)) {
        savedRecipes.push(recipeId);
      }
    } else {
      const index = savedRecipes.indexOf(recipeId);
      if (index > -1) savedRecipes.splice(index, 1);
    }
    localStorage.setItem(`savedRecipes_${user.id}`, JSON.stringify(savedRecipes));
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    
    if (pendingAction === 'like') {
      setTimeout(handleLike, 100);
    } else if (pendingAction === 'follow') {
      setTimeout(handleFollow, 100);
    } else if (pendingAction === 'save') {
      setTimeout(handleSave, 100);
    }
    
    setPendingAction(null);
  };

  // Text-to-Speech Functions
  const speakMessage = useCallback((message: string) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    // Clean the message (remove emojis and special characters for better speech)
    const cleanMessage = message
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      .replace(/[🎉🍽️👨‍🍳🌟🔥✨🎯🏆👍✅⏱️🔔]/g, '')
      .replace(/!/g, '.')
      .trim();
    
    if (!cleanMessage) return;
    
    try {
      const utterance = new SpeechSynthesisUtterance(cleanMessage);
      
      // Enhanced voice settings for clarity
      utterance.rate = 0.85;      // Slightly slower for clarity
      utterance.pitch = 1.0;      // Natural pitch
      utterance.volume = 0.9;     // Higher volume
      
      // Enhanced voice selection with multi-language support
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        let selectedVoice = null;
        
        // Language-specific voice priorities
        const languageVoices = {
          'en': {
            langCodes: ['en-US', 'en-GB', 'en-AU', 'en-CA', 'en'],
            priorities: [
              // Premium/Natural voices
              'Samantha', 'Karen', 'Alex', 'Victoria', 'Allison', 'Ava', 'Susan', 'Vicki',
              
              // Google voices (high quality)
              'Google US English', 'Google UK English Female', 'Google UK English Male',
              'en-US-Standard-C', 'en-US-Standard-E', 'en-US-Standard-F', 'en-US-Standard-G',
              'en-US-Standard-H', 'en-US-Standard-J', 'en-US-Wavenet-C', 'en-US-Wavenet-E',
              'en-US-Wavenet-F', 'en-US-Wavenet-G', 'en-US-Wavenet-H', 'en-US-Wavenet-J',
              
              // Microsoft voices
              'Microsoft Zira Desktop', 'Microsoft Eva Desktop', 'Microsoft Hazel Desktop',
              
              // Browser default English voices
              'English Female', 'English Male', 'Female', 'Male'
            ]
          },
          'ta': {
            langCodes: ['ta-IN', 'ta'],
            priorities: [
              // Google Tamil voices
              'Google தமிழ்', 'Google Tamil', 'ta-IN-Standard-A', 'ta-IN-Standard-B',
              'ta-IN-Standard-C', 'ta-IN-Standard-D', 'ta-IN-Wavenet-A', 'ta-IN-Wavenet-B',
              'ta-IN-Wavenet-C', 'ta-IN-Wavenet-D',
              
              // Microsoft Tamil voices
              'Microsoft Tamil Desktop', 'Microsoft Tamil',
              
              // Browser default Tamil voices
              'Tamil Female', 'Tamil Male', 'Tamil'
            ]
          },
          'te': {
            langCodes: ['te-IN', 'te'],
            priorities: [
              // Google Telugu voices
              'Google తెలుగు', 'Google Telugu', 'te-IN-Standard-A', 'te-IN-Standard-B',
              'te-IN-Wavenet-A', 'te-IN-Wavenet-B',
              
              // Microsoft Telugu voices
              'Microsoft Telugu Desktop', 'Microsoft Telugu',
              
              // Browser default Telugu voices
              'Telugu Female', 'Telugu Male', 'Telugu'
            ]
          }
        };
        
        const currentLangConfig = languageVoices[selectedLanguage];
        
        // Try to find voices in priority order for selected language
        for (const voiceName of currentLangConfig.priorities) {
          selectedVoice = voices.find(voice => 
            voice.name.includes(voiceName) && 
            currentLangConfig.langCodes.some(langCode => voice.lang.startsWith(langCode))
          );
          if (selectedVoice) break;
        }
        
        // Fallback: any voice for the selected language
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            currentLangConfig.langCodes.some(langCode => voice.lang.startsWith(langCode)) &&
            (voice.name.toLowerCase().includes('female') || 
             voice.name.toLowerCase().includes('woman') ||
             voice.name.toLowerCase().includes('girl'))
          );
        }
        
        // Last resort: any voice for the selected language
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            currentLangConfig.langCodes.some(langCode => voice.lang.startsWith(langCode))
          );
        }
        
        // Ultimate fallback: English voice
        if (!selectedVoice && selectedLanguage !== 'en') {
          selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang;
          console.log('Selected voice:', selectedVoice.name, selectedVoice.lang);
        }
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error in speakMessage:', error);
      setIsSpeaking(false);
    }
  }, [isVoiceEnabled, selectedLanguage]);

  const toggleVoice = async () => {
    if (!isVoiceEnabled) {
      // Show voice settings modal first
      setShowVoiceSettings(true);
    } else {
      // Disable voice
      setIsVoiceEnabled(false);
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const enableVoiceWithSettings = async (includeInstructionsChoice: boolean, language: 'en' | 'ta' | 'te' = 'en') => {
    try {
      // Check if speech synthesis is supported
      if (!window.speechSynthesis) {
        alert('Sorry, your browser does not support text-to-speech.');
        return;
      }

      // Load voices if not already loaded
      if (window.speechSynthesis.getVoices().length === 0) {
        // Wait for voices to load
        await new Promise((resolve) => {
          window.speechSynthesis.onvoiceschanged = resolve;
          setTimeout(resolve, 1000); // Fallback timeout
        });
      }

      setIncludeInstructions(includeInstructionsChoice);
      setSelectedLanguage(language);
      setIsVoiceEnabled(true);
      setShowVoiceSettings(false);
      
      // Language-specific test messages
      const testMessages = {
        'en': `Voice mode activated! ${includeInstructionsChoice ? "I'll read step instructions and cooking tips." : "I'll share cooking tips only."}`,
        'ta': `குரல் முறை செயல்படுத்தப்பட்டது! ${includeInstructionsChoice ? "நான் படி வழிமுறைகளையும் சமையல் குறிப்புகளையும் படிப்பேன்." : "நான் சமையல் குறிப்புகளை மட்டும் பகிர்வேன்."}`,
        'te': `వాయిస్ మోడ్ యాక్టివేట్ చేయబడింది! ${includeInstructionsChoice ? "నేను స్టెప్ సూచనలు మరియు వంట చిట్కాలను చదువుతాను." : "నేను వంట చిట్కాలను మాత్రమే పంచుకుంటాను."}`
      };
      
      const testMessage = testMessages[language];
      const utterance = new SpeechSynthesisUtterance(testMessage);
      utterance.volume = 0.9;
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      
      // Use the same enhanced voice selection logic
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const languageVoices = {
          'en': {
            langCodes: ['en-US', 'en-GB', 'en-AU', 'en-CA', 'en'],
            priorities: ['Samantha', 'Karen', 'Alex', 'Victoria', 'Google US English', 'English Female']
          },
          'ta': {
            langCodes: ['ta-IN', 'ta'],
            priorities: ['Google தமிழ்', 'Google Tamil', 'ta-IN-Standard-A', 'ta-IN-Wavenet-A', 'Tamil Female', 'Tamil']
          },
          'te': {
            langCodes: ['te-IN', 'te'],
            priorities: ['Google తెలుగు', 'Google Telugu', 'te-IN-Standard-A', 'te-IN-Wavenet-A', 'Telugu Female', 'Telugu']
          }
        };
        
        const currentLangConfig = languageVoices[language];
        let selectedVoice = null;
        
        for (const voiceName of currentLangConfig.priorities) {
          selectedVoice = voices.find(voice => 
            voice.name.includes(voiceName) && 
            currentLangConfig.langCodes.some(langCode => voice.lang.startsWith(langCode))
          );
          if (selectedVoice) break;
        }
        
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            currentLangConfig.langCodes.some(langCode => voice.lang.startsWith(langCode))
          );
        }
        
        if (!selectedVoice && language !== 'en') {
          selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang;
          console.log('Test voice selected:', selectedVoice.name);
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (error) => {
        console.error('Speech error:', error);
        setIsSpeaking(false);
        alert('There was an issue with text-to-speech. Please check your browser settings.');
      };

      window.speechSynthesis.speak(utterance);
        
    } catch (error) {
      console.error('Error enabling voice:', error);
      alert('Unable to enable voice. Please check your browser permissions.');
    }
  };

  const updateChefMessage = useCallback((message: string) => {
    setChefMessage(message);
    setShowChefTip(true);
    speakMessage(message);
    setTimeout(() => setShowChefTip(false), 3000);
  }, [speakMessage]);

  // Translate messages based on selected language
  const translateMessage = useCallback((englishMessage: string): string => {
    const translations: { [key: string]: { ta: string; te: string } } = {
      "Ready to cook? Let's make something delicious together!": {
        ta: "சமைக்க தயாரா? ஒன்றாக ருசியான உணவு செய்வோம்!",
        te: "వంట చేయడానికి సిద్ధంగా ఉన్నారా? కలిసి రుచికరమైన ఆహారం చేద్దాం!"
      },
      "🎉 Welcome to Chef Mode! Let's cook this amazing recipe together step by step!": {
        ta: "🎉 செஃப் முறைக்கு வரவேற்கிறோம்! இந்த அற்புதமான ரெசிபியை ஒன்றாக படிப்படியாக சமைப்போம்!",
        te: "🎉 చెఫ్ మోడ్‌కు స్వాగతం! ఈ అద్భుతమైన రెసిపీని మనం కలిసి దశల వారీగా వండుకుందాం!"
      },
      "Thanks for cooking with me! Hope you enjoyed it!": {
        ta: "என்னுடன் சமைத்ததற்கு நன்றி! நீங்கள் அனுபவித்தீர்கள் என்று நம்புகிறேன்!",
        te: "నాతో వంట చేసినందుకు ధన్యవాదాలు! మీరు ఆనందించారని ఆశిస్తున్నాను!"
      },
      "🎉🍽️ CONGRATULATIONS! You've completed the recipe! Time to enjoy your delicious creation! Well done, chef!": {
        ta: "🎉🍽️ வாழ்த்துக்கள்! நீங்கள் ரெசிபியை முடித்தீர்கள்! உங்கள் சுவையான படைப்பை அனுபவிக்கும் நேரம்! நல்லது செஃப்!",
        te: "🎉🍽️ అభినందనలు! మీరు రెసిపీని పూర్తి చేశారు! మీ రుచికరమైన సృష్టిని ఆస్వాదించే సమయం! బాగా చేశారు, చెఫ్!"
      },
      "🌟 Excellent work! You're doing amazing!": {
        ta: "🌟 சிறந்த வேலை! நீங்கள் அற்புதமாக செய்கிறீர்கள்!",
        te: "🌟 అద్భుతమైన పని! మీరు అద్భుతంగా చేస్తున్నారు!"
      },
      "👨‍🍳 Perfect technique! Keep it up!": {
        ta: "👨‍🍳 சரியான நுட்பம்! தொடருங்கள்!",
        te: "👨‍🍳 పరిపూర్ణ పద్ధతి! కొనసాగించండి!"
      },
      "🔥 You're cooking like a pro!": {
        ta: "🔥 நீங்கள் ஒரு தொழில்முறை போல சமைக்கிறீர்கள்!",
        te: "🔥 మీరు ప్రొఫెషనల్ లాగా వండుతున్నారు!"
      },
      "✨ Wonderful! The aroma must be incredible!": {
        ta: "✨ அருமை! வாசனை நம்பமுடியாததாக இருக்க வேண்டும்!",
        te: "✨ అద్భుతం! వాసన అద్భుతంగా ఉండాలి!"
      },
      "🎯 Outstanding! Almost there!": {
        ta: "🎯 சிறப்பு! கிட்டத்தட்ட வந்துவிட்டோம்!",
        te: "🎯 అద్భుతం! దాదాపు వచ్చేశాం!"
      },
      "🏆 Fantastic! You're mastering this recipe!": {
        ta: "🏆 அருமை! இந்த ரெசிபியில் நீங்கள் தேர்ச்சி பெற்றுவிட்டீர்கள்!",
        te: "🏆 అద్భుతం! మీరు ఈ రెసిపీలో నైపుణ్యం సాధిస్తున్నారు!"
      },
      "👍 No worries! Let's take our time and get it right.": {
        ta: "👍 கவலை வேண்டாம்! நேரம் எடுத்துக்கொண்டு சரியாக செய்வோம்.",
        te: "👍 ఆందోళన వద్దు! మన సమయం తీసుకుని సరిగ్గా చేద్దాం."
      }
    };

    if (selectedLanguage === 'en') {
      return englishMessage;
    }

    const translation = translations[englishMessage];
    if (translation && translation[selectedLanguage]) {
      return translation[selectedLanguage];
    }

    // Fallback to English if no translation found
    return englishMessage;
  }, [selectedLanguage]);

  // Cooking Mode Functions
  const startCookingMode = () => {
    setIsCookingMode(true);
    setCurrentStep(0);
    setCompletedSteps(new Array(displayRecipe.steps.length).fill(false));
    const welcomeMessage = translateMessage("🎉 Welcome to Chef Mode! Let's cook this amazing recipe together step by step!");
    updateChefMessage(welcomeMessage);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const exitCookingMode = () => {
    setIsCookingMode(false);
    setCurrentStep(0);
    setCompletedSteps([]);
    setCookingTimer(0);
    setIsTimerRunning(false);
    const thankYouMessage = translateMessage("Thanks for cooking with me! Hope you enjoyed it!");
    updateChefMessage(thankYouMessage);
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  const nextStep = () => {
    // Clear any running timer when moving to next step
    if (isTimerRunning) {
      setIsTimerRunning(false);
      setCookingTimer(0);
    }
    
    // Mark current step as completed
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[currentStep] = true;
    setCompletedSteps(newCompletedSteps);
    
    // Check if this is the last step
    if (currentStep === displayRecipe.steps.length - 1) {
      // This was the final step - show celebration and exit
      const congratsMessage = translateMessage("🎉🍽️ CONGRATULATIONS! You've completed the recipe! Time to enjoy your delicious creation! Well done, chef!");
      updateChefMessage(congratsMessage);
      setTimeout(() => {
        exitCookingMode();
      }, 4000);
    } else {
      // Move to next step
      setCurrentStep(currentStep + 1);
      
      const stepMessages = [
        "🌟 Excellent work! You're doing amazing!",
        "👨‍🍳 Perfect technique! Keep it up!",
        "🔥 You're cooking like a pro!",
        "✨ Wonderful! The aroma must be incredible!",
        "🎯 Outstanding! Almost there!",
        "🏆 Fantastic! You're mastering this recipe!"
      ];
      
      const randomMessage = stepMessages[Math.floor(Math.random() * stepMessages.length)];
      const translatedMessage = translateMessage(randomMessage);
      updateChefMessageWithStep(translatedMessage, currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      // Clear any running timer when moving to previous step
      if (isTimerRunning) {
        setIsTimerRunning(false);
        setCookingTimer(0);
      }
      
      setCurrentStep(currentStep - 1);
      const backMessage = translateMessage("👍 No worries! Let's take our time and get it right.");
      updateChefMessageWithStep(backMessage, currentStep - 1);
    }
  };

  const startTimer = (minutes: number) => {
    setCookingTimer(minutes * 60);
    setIsTimerRunning(true);
    const timerMessage = selectedLanguage === 'ta' 
      ? `⏱️ ${minutes} நிமிடங்களுக்கு டைமர் அமைக்கப்பட்டது! நான் உங்களுக்காக நேரத்தைக் கண்காணிப்பேன்.`
      : selectedLanguage === 'te'
      ? `⏱️ ${minutes} నిమిషాలకు టైమర్ సెట్ చేయబడింది! నేను మీ కోసం సమయాన్ని ట్రాక్ చేస్తాను.`
      : `⏱️ Timer set for ${minutes} minutes! I'll keep track of time for you.`;
    updateChefMessage(timerMessage);
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && cookingTimer > 0) {
      interval = setInterval(() => {
        setCookingTimer(timer => {
          if (timer <= 1) {
            setIsTimerRunning(false);
            const timeUpMessage = selectedLanguage === 'ta' 
              ? "🔔 நேரம் முடிந்தது! உங்கள் சமையலைச் சரிபார்க்கவும் - இது இப்போது சரியாக இருக்க வேண்டும்!"
              : selectedLanguage === 'te'
              ? "🔔 సమయం ముగిసింది! మీ వంటను తనిఖీ చేయండి - ఇది ఇప్పుడు పర్ఫెక్ట్‌గా ఉండాలి!"
              : "🔔 Time's up! Check your cooking - it should be perfect now!";
            updateChefMessage(timeUpMessage);
            return 0;
          }
          return timer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, cookingTimer, updateChefMessage, selectedLanguage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mock recipe data as fallback
  const mockRecipe = {
    id: recipeId,
    title: 'Spicy Thai Green Curry',
    description: 'A vibrant and aromatic curry with coconut milk, fresh herbs, and vegetables that brings the authentic taste of Thailand to your kitchen.',
    image: '/placeholder-recipe.jpg',
    cookingTime: 30,
    servings: 4,
    difficulty: 'Medium',
    likes: 124,
    author: {
      name: 'Chef Maria',
      avatar: '/placeholder-avatar.jpg',
      recipes: 23,
      followers: 1200
    },
    ingredients: [
      '2 tbsp green curry paste',
      '400ml coconut milk',
      '300g chicken breast, sliced',
      '1 Thai eggplant, cubed',
      '100g green beans, trimmed',
      '2 kaffir lime leaves',
      '1 tbsp fish sauce',
      '1 tbsp palm sugar',
      'Fresh Thai basil leaves',
      'Red chilies for garnish'
    ],
    steps: [
      'Heat 2 tbsp of thick coconut milk in a wok over medium heat until oil separates.',
      'Add green curry paste and fry for 2-3 minutes until fragrant.',
      'Add chicken pieces and cook until just done, about 5 minutes.',
      'Pour in remaining coconut milk and bring to a gentle simmer.',
      'Add eggplant, green beans, and kaffir lime leaves. Simmer for 10 minutes.',
      'Season with fish sauce and palm sugar to taste.',
      'Remove from heat and stir in fresh Thai basil leaves.',
      'Serve hot with jasmine rice and garnish with red chilies.'
    ],
    tags: ['Thai', 'Spicy', 'Coconut', 'Chicken'],
    cuisine: 'Thai'
  };

  const displayRecipe = recipe || mockRecipe;

  // Enhanced message function with instructions and immediate step switching
  const updateChefMessageWithStep = useCallback((message: string, stepIndex?: number) => {
    setChefMessage(message);
    setShowChefTip(true);
    
    // Stop any current speech immediately
    window.speechSynthesis.cancel();
    
    if (!isVoiceEnabled) {
      setTimeout(() => setShowChefTip(false), 3000);
      return;
    }
    
    let fullMessage = message;
    
    // Add step instructions if enabled and step index provided
    if (includeInstructions && stepIndex !== undefined && displayRecipe.steps) {
      const currentStepText = displayRecipe.steps[stepIndex];
      
      if (currentStepText) {
        // Translate step prefix based on language
        const stepPrefix = selectedLanguage === 'ta' ? `படி ${stepIndex + 1}: ` :
                          selectedLanguage === 'te' ? `స్టెప్ ${stepIndex + 1}: ` :
                          `Step ${stepIndex + 1}: `;
        
        const instructionText = stepPrefix + currentStepText + '. ';
        fullMessage = instructionText + message;
      }
    }
    
    // Clean and speak the message
    const cleanMessage = fullMessage
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      .replace(/[🎉🍽️👨‍🍳🌟🔥✨🎯🏆👍✅⏱️🔔]/g, '')
      .replace(/!/g, '.')
      .trim();
    
    if (cleanMessage) {
      speakMessage(cleanMessage);
    }
    
    setTimeout(() => setShowChefTip(false), 3000);
  }, [isVoiceEnabled, includeInstructions, displayRecipe.steps, speakMessage, selectedLanguage]);

  const toggleIngredient = (index: number) => {
    const newChecked = [...checkedIngredients];
    newChecked[index] = !newChecked[index];
    setCheckedIngredients(newChecked);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Recipe not found</h2>
          <p className="text-gray-600 mb-4">The recipe you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="text-green-600 hover:text-green-700 underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }
  
  const imageData = getRecipeImageOrBackground(recipe, false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/recipes" 
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Back to Recipes</span>
              <span className="sm:hidden">Back</span>
            </Link>
            
            <Link href="/" className="flex items-center space-x-2">
              <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <span className="text-lg sm:text-2xl font-bold text-gray-900 hidden xs:block">RecipeWorld</span>
              <span className="text-lg font-bold text-gray-900 xs:hidden">RecipeWorld</span>
            </Link>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleSave}
                className={`p-2 rounded-full transition-colors ${
                  isSaved ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:text-green-600'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save recipe'}
              >
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recipe Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 animate-fade-in">
          {/* Recipe Image */}
          <div className="relative h-80 bg-gray-200">
            {imageData.hasImage ? (
              <Image
                src={recipe.image || '/api/placeholder/400/300'}
                alt={recipe.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div 
                className="w-full h-full flex flex-col items-center justify-center relative group-hover:scale-105 transition-transform duration-300"
                style={{ background: imageData.background }}
              >
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">{imageData.emoji}</div>
                  <div className="text-sm font-medium opacity-90">{imageData.cuisine}</div>
                  <div className="text-xs opacity-75 mt-1">Cuisine</div>
                </div>
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Title and Description */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{displayRecipe.title}</h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">{displayRecipe.description}</p>

            {/* Recipe Meta */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <div className="flex items-center flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{displayRecipe.cookingTime} mins</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{displayRecipe.servings} servings</span>
                </div>
                <div className="px-2 sm:px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                  {displayRecipe.difficulty}
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-full transition-all text-sm ${
                    isLiked 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                  }`}
                >
                  <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likesCount}</span>
                </button>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
              {displayRecipe.author?.avatar ? (
                <Image
                  src={displayRecipe.author.avatar}
                  alt={displayRecipe.author.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{displayRecipe.author?.name || 'Unknown Author'}</h3>
                <p className="text-sm text-gray-600">
                  {displayRecipe.author?.recipes || 0} recipes • {displayRecipe.author?.followers || 0} followers
                </p>
              </div>
              {user && (displayRecipe.author?._id || displayRecipe.author?.id) !== user.id && (
                <button 
                  onClick={handleFollow}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isFollowing 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              {user && (displayRecipe.author?._id || displayRecipe.author?.id) === user.id && (
                <span className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-medium">
                  Your Recipe
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in-delay">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ingredients</h2>
              <div className="space-y-3">
                {(displayRecipe.ingredients || []).map((ingredient: string, index: number) => (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={checkedIngredients[index] || false}
                      onChange={() => toggleIngredient(index)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className={`text-gray-700 group-hover:text-green-600 transition-colors ${
                      checkedIngredients[index] ? 'line-through text-gray-400' : ''
                    }`}>
                      {ingredient}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in-delay-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Instructions</h2>
                <button
                  onClick={startCookingMode}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Play className="h-5 w-5" />
                  <span className="hidden sm:inline">Cook with Chef</span>
                  <span className="sm:hidden">Chef Mode</span>
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-6">
                {(displayRecipe.steps || []).map((step: string, index: number) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {(displayRecipe.tags || []).map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium hover:bg-green-200 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Full-Screen Cooking Mode Modal */}
      {isCookingMode && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-full max-h-[98vh] overflow-hidden animate-scale-in flex flex-col">
            {/* Compact Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 sm:p-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <ChefHat className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">Chef Mode</h2>
                    <p className="text-orange-100 text-xs sm:text-sm">Step {currentStep + 1} of {displayRecipe.steps?.length || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleVoice}
                    className={`p-2 rounded-lg transition-colors ${
                      isVoiceEnabled 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    title={isVoiceEnabled ? 'Disable Voice' : 'Enable Voice'}
                  >
                    {isVoiceEnabled ? (
                      <Volume2 className={`h-5 w-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                    ) : (
                      <VolumeX className="h-5 w-5" />
                    )}
                  </button>
                  
                  <button
                    onClick={exitCookingMode}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="Exit Cooking Mode"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Compact Progress */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-orange-100">Progress</span>
                <span className="text-xs text-orange-100">{Math.round(((currentStep + 1) / (displayRecipe.steps?.length || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div 
                  className="bg-white h-1.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep + 1) / (displayRecipe.steps?.length || 1)) * 100}%` }}
                ></div>
              </div>
              
              {/* Mini Step Indicators */}
              <div className="flex justify-center mt-2 space-x-1">
                {(displayRecipe.steps || []).map((_: string, index: number) => (
                  <div 
                    key={index} 
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index < currentStep 
                        ? 'bg-green-400' 
                        : index === currentStep
                        ? 'bg-white ring-2 ring-white/50'
                        : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Main Content Area - No Scroll */}
            <div className="flex-1 flex overflow-hidden">
              {/* Chef Character - Fixed Position */}
              <div className="hidden lg:flex lg:w-64 bg-gradient-to-b from-orange-50 to-red-50 p-4 flex-col justify-center">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-20 h-20 bg-gradient-to-b from-orange-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg float animate-pulse-slow">
                      <div className="text-3xl">👨‍🍳</div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg animate-bounce">
                      <ChefHat className="h-4 w-4 text-orange-500 m-1" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-lg relative">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                      <div className="w-4 h-4 bg-white rotate-45"></div>
                    </div>
                    <p className="text-gray-800 font-medium text-sm leading-relaxed">
                      {chefMessage}
                    </p>
                    {showChefTip && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full animate-ping">
                        <Sparkles className="h-3 w-3 text-white m-1" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Chef - Compact */}
              <div className="lg:hidden absolute top-20 right-4 z-10">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-b from-orange-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg float">
                    <div className="text-xl">👨‍🍳</div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow-lg animate-bounce">
                    <ChefHat className="h-3 w-3 text-orange-500 m-0.5" />
                  </div>
                  {showChefTip && (
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping">
                      <Sparkles className="h-2 w-2 text-white m-1" />
                    </div>
                  )}
                </div>
              </div>

              {/* Main Step Content */}
              <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                {/* Current Step Display */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                      completedSteps[currentStep] 
                        ? 'bg-green-500 text-white' 
                        : 'bg-orange-500 text-white'
                    }`}>
                      {completedSteps[currentStep] ? <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" /> : currentStep + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-lg sm:text-xl font-semibold text-gray-800 block">Step {currentStep + 1}</span>
                      {isTimerRunning && (
                        <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm mt-1">
                          <Timer className="h-4 w-4" />
                          <span className="font-mono font-bold">{formatTime(cookingTimer)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border-l-4 border-orange-500 mb-4">
                    <p className="text-base sm:text-lg text-gray-800 leading-relaxed mb-3">
                      {(displayRecipe.steps || [])[currentStep]}
                    </p>
                    
                    {/* Quick Timer Buttons */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm text-gray-600 mr-2">Quick timers:</span>
                      {[5, 10, 15, 20].map((minutes) => (
                        <button
                          key={minutes}
                          onClick={() => startTimer(minutes)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          {minutes}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Chef Message */}
                  <div className="lg:hidden bg-orange-50 rounded-lg p-3 mb-4">
                    <p className="text-gray-800 text-sm font-medium text-center">
                      {chefMessage}
                    </p>
                  </div>

                  {/* Voice Hint */}
                  {!isVoiceEnabled && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <Volume2 className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          💡 Tip: Click the 🔊 button above to enable voice guidance for hands-free cooking!
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons - Fixed at bottom */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center justify-center space-x-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SkipBack className="h-5 w-5" />
                    <span>Previous Step</span>
                  </button>

                  <button
                    onClick={nextStep}
                    className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {currentStep === (displayRecipe.steps?.length || 1) - 1 ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Complete Recipe</span>
                      </>
                    ) : (
                      <>
                        <span>Next Step</span>
                        <SkipForward className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Voice Settings Modal */}
      {showVoiceSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Volume2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Voice Settings</h2>
                  <p className="text-orange-100 text-sm">Configure your cooking assistant</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Language Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Choose your preferred language
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedLanguage('en')}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      selectedLanguage === 'en' 
                        ? 'border-orange-400 bg-orange-50 text-orange-700' 
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <div className="text-xl mb-1">🇺🇸</div>
                    <div className="text-sm font-medium">English</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedLanguage('ta')}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      selectedLanguage === 'ta' 
                        ? 'border-orange-400 bg-orange-50 text-orange-700' 
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <div className="text-xl mb-1">🇮🇳</div>
                    <div className="text-sm font-medium">தமிழ்</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedLanguage('te')}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      selectedLanguage === 'te' 
                        ? 'border-orange-400 bg-orange-50 text-orange-700' 
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <div className="text-xl mb-1">🇮🇳</div>
                    <div className="text-sm font-medium">తెలుగు</div>
                  </button>
                </div>
              </div>

              {/* Content Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  What would you like the chef to tell you?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Choose whether you want detailed step instructions read aloud or just cooking tips.
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => enableVoiceWithSettings(true, selectedLanguage)}
                  className="w-full p-4 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all text-left"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 mb-1">
                        📋 Instructions + Cooking Tips
                      </div>
                      <div className="text-sm text-gray-600">
                        Chef will read out each step&apos;s instructions, plus cooking guidance
                      </div>
                      <div className="text-xs text-orange-600 mt-1 font-medium">
                        {selectedLanguage === 'en' && "Example: \"Step 2: Add green curry paste and fry for 2-3 minutes until fragrant. Perfect technique! Keep it up!\""}
                        {selectedLanguage === 'ta' && "உதாரணம்: \"படி 2: பச்சை கறி விழுது சேர்த்து 2-3 நிமிடங்கள் வாசனை வரும் வரை வறுக்கவும். சிறந்த நுட்பம்! தொடருங்கள்!\""}
                        {selectedLanguage === 'te' && "ఉదాహరణ: \"స్టెప్ 2: గ్రీన్ కర్రీ పేస్ట్ జోడించి 2-3 నిమిషాలు వాసన వచ్చే వరకు వేయించండి. అద్భుతమైన పద్ధతి! కొనసాగించండి!\""}
                      </div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => enableVoiceWithSettings(false, selectedLanguage)}
                  className="w-full p-4 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all text-left"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 mb-1">
                        💬 Cooking Tips Only
                      </div>
                      <div className="text-sm text-gray-600">
                        Chef will only provide cooking guidance and encouragement
                      </div>
                      <div className="text-xs text-blue-600 mt-1 font-medium">
                        {selectedLanguage === 'en' && "Example: \"Excellent work! You're doing amazing!\""}
                        {selectedLanguage === 'ta' && "உதாரணம்: \"சிறந்த வேலை! நீங்கள் அற்புதமாக செய்கிறீர்கள்!\""}
                        {selectedLanguage === 'te' && "ఉదాహరణ: \"అద్భుతమైన పని! మీరు అద్భుతంగా చేస్తున్నారు!\""}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowVoiceSettings(false)}
                  className="w-full py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.6);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes animate-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes animate-fade-in-delay {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes animate-fade-in-delay-2 {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes animate-fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .bounce-in {
          animation: bounce-in 0.6s ease-out;
        }

        .pulse-glow {
          animation: pulse-glow 2s infinite;
        }

        .float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: animate-fade-in 0.6s ease-out;
        }

        .animate-fade-in-delay {
          animation: animate-fade-in-delay 0.6s ease-out 0.2s both;
        }

        .animate-fade-in-delay-2 {
          animation: animate-fade-in-delay-2 0.6s ease-out 0.4s both;
        }

        .animate-fade-in-up {
          animation: animate-fade-in-up 0.6s ease-out 0.6s both;
        }

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

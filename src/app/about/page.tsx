'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  Globe, 
  Users, 
  Heart, 
  Smartphone, 
  Zap, 
  Shield, 
  Mail, 
  Github, 
  Linkedin, 
  Twitter,
  Send,
  ChefHat,
  Star,
  Filter
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useSubmitContactMutation } from '@/features/contact/contactApi';

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [submitContact] = useSubmitContactMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitContact(formData).unwrap();
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Failed to submit contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const problems = [
    {
      icon: <Search className="h-8 w-8 text-red-500" />,
      title: "Recipe Discovery Paralysis",
      description: "People spend hours scrolling through countless recipes without finding what truly matches their taste and cultural preferences."
    },
    {
      icon: <Globe className="h-8 w-8 text-orange-500" />,
      title: "Cultural Food Disconnect",
      description: "Generic recipe platforms don't understand regional preferences, showing Italian recipes to users who prefer Indian cuisine."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Fragmented Sharing Experience",
      description: "Home cooks struggle to organize, share, and discover recipes in a personalized, community-driven environment."
    }
  ];

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: "Google-Style Instant Search",
      description: "Real-time search with intelligent suggestions, recipe previews, and instant results as you type."
    },
    {
      icon: <Globe className="h-6 w-6 text-green-500" />,
      title: "Regional Intelligence",
      description: "Automatically prioritizes recipes from your region's cuisine preferences based on your location."
    },
    {
      icon: <Filter className="h-6 w-6 text-blue-500" />,
      title: "Advanced Filtering",
      description: "Filter by cuisine, difficulty, cooking time, ratings, and dietary preferences with smart categorization."
    },
    {
      icon: <Heart className="h-6 w-6 text-red-500" />,
      title: "Social Recipe Sharing",
      description: "Like, save, follow, and share recipes with a vibrant community of food enthusiasts."
    },
    {
      icon: <Smartphone className="h-6 w-6 text-purple-500" />,
      title: "Mobile-First Design",
      description: "Seamless experience across all devices with responsive design and optimized performance."
    },
    {
      icon: <Shield className="h-6 w-6 text-indigo-500" />,
      title: "Secure Authentication",
      description: "Multiple sign-in options including Google OAuth with enterprise-grade security."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <ChefHat className="h-12 w-12 text-green-600 mr-3" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Welcome To RecipeWorld</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Revolutionizing how people discover, share, and connect through food across cultures and communities.
          </p>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Problems We&apos;re Solving</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The recipe sharing landscape is fragmented, culturally disconnected, and lacks intelligent personalization. 
              recipeworld addresses these core issues with innovative solutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center mb-4">
                  {problem.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{problem.title}</h3>
                <p className="text-gray-600 leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Innovative Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Built with cutting-edge technology to deliver an unparalleled recipe discovery and sharing experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">{feature.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Profile */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet the Developer</h2>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Image
                  src="/placeholder-avatar.svg"
                  alt="Developer Profile"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full">
                  <ChefHat className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sakthi</h3>
            <p className="text-lg text-green-600 font-semibold mb-4">Full-Stack Software Developer</p>
            
            <div className="max-w-2xl mx-auto mb-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                Passionate about creating technology that brings people together through shared experiences. 
                As a food enthusiast and developer, I recognized the gap in how people discover and share recipes 
                across different cultures and regions.
              </p>
              <p className="text-gray-700 leading-relaxed">
                FlavorShare combines my love for cooking with cutting-edge web technologies to solve real-world 
                problems in the culinary community. Built with Next.js 15, TypeScript, and modern design principles 
                to deliver an exceptional user experience.
              </p>
            </div>
            
            {/* Social Media Links */}
            <div className="flex justify-center space-x-6 mb-6">
              <a 
                href="https://github.com/sakthi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Github className="h-5 w-5" />
                <span>GitHub</span>
              </a>
              <a 
                href="https://linkedin.com/in/sakthi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
              </a>
              <a 
                href="https://twitter.com/sakthi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span>Twitter</span>
              </a>
            </div>

            <div className="flex justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span>5+ Years Experience</span>
              </div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-red-500 mr-1" />
                <span>Food Enthusiast</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600">
              Have questions, suggestions, or want to collaborate? I&apos;d love to hear from you!
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="bg-green-100 text-green-800 p-4 rounded-lg inline-block mb-4">
                  <Mail className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Message Sent Successfully!</h3>
                  <p>Thank you for reaching out. I&apos;ll get back to you soon.</p>
                </div>
                <button 
                  onClick={() => setSubmitSuccess(false)}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="What's this about?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Tell me more about your thoughts, suggestions, or questions..."
                  />
                </div>
                
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Sharing?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community of food enthusiasts and start discovering amazing recipes today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/recipes"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Browse Recipes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

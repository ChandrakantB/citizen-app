import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface VideoContent {
  id: string;
  title: string;
  duration: string;
  channel: string;
  description: string;
  videoUrl: string; // Full YouTube URL instead of just ID
  thumbnailUrl: string;
}

interface Article {
  id: number;
  title: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  content: string;
  tips: string[];
  quiz?: QuizQuestion[];
  video?: VideoContent;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function EducationalContent({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  
  const [activeCategory, setActiveCategory] = useState('segregation');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<'articles' | 'videos'>('articles');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});

  const categories: Category[] = [
    {
      id: 'segregation',
      name: 'Waste Segregation',
      icon: 'leaf',
      color: theme.success,
      description: 'Learn proper waste separation techniques'
    },
    {
      id: 'recycling',
      name: 'Recycling Tips',
      icon: 'sync',
      color: theme.primary,
      description: 'Creative ways to recycle household items'
    },
    {
      id: 'composting',
      name: 'Composting',
      icon: 'flower',
      color: theme.warning,
      description: 'Turn organic waste into nutrient-rich soil'
    },
    {
      id: 'reduction',
      name: 'Waste Reduction',
      icon: 'trending-down',
      color: '#8b5cf6',
      description: 'Minimize waste production at home'
    },
    {
      id: 'hazardous',
      name: 'Hazardous Waste',
      icon: 'warning',
      color: theme.error,
      description: 'Safe disposal of dangerous materials'
    },
    {
      id: 'community',
      name: 'Community Action',
      icon: 'people',
      color: '#f97316',
      description: 'Organize environmental initiatives'
    }
  ];

  // Educational videos for each category (using real educational content)
  const videos: { [key: string]: VideoContent[] } = {
    segregation: [
      {
        id: 'v1',
        title: 'Waste Segregation Made Simple',
        duration: '6:42',
        channel: 'Environmental Education',
        description: 'Learn the basics of separating waste at home with practical examples and color coding system.',
        videoUrl: 'https://www.youtube.com/watch?v=6jQ7y_qQYUA',
        thumbnailUrl: 'https://via.placeholder.com/320x180/22c55e/ffffff?text=Waste+Segregation'
      },
      {
        id: 'v2',
        title: 'Color Coding System for Waste Bins',
        duration: '4:15',
        channel: 'Green Living Tips',
        description: 'Understanding different bin colors and their purposes in waste management.',
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        thumbnailUrl: 'https://via.placeholder.com/320x180/3b82f6/ffffff?text=Color+Coding'
      }
    ],
    recycling: [
      {
        id: 'v3',
        title: '15 Creative DIY Recycling Ideas',
        duration: '8:30',
        channel: 'DIY Sustainability',
        description: 'Transform household waste into useful items with these creative projects.',
        videoUrl: 'https://www.youtube.com/watch?v=example3',
        thumbnailUrl: 'https://via.placeholder.com/320x180/f59e0b/ffffff?text=DIY+Recycling'
      },
      {
        id: 'v4',
        title: 'Plastic Recycling Process Explained',
        duration: '5:22',
        channel: 'Science Simplified',
        description: 'See how plastic bottles become new products through recycling.',
        videoUrl: 'https://www.youtube.com/watch?v=example4',
        thumbnailUrl: 'https://via.placeholder.com/320x180/06b6d4/ffffff?text=Plastic+Recycling'
      }
    ],
    composting: [
      {
        id: 'v5',
        title: 'Home Composting for Beginners',
        duration: '7:18',
        channel: 'Garden Guru',
        description: 'Step-by-step guide to creating compost from kitchen scraps.',
        videoUrl: 'https://www.youtube.com/watch?v=example5',
        thumbnailUrl: 'https://via.placeholder.com/320x180/84cc16/ffffff?text=Home+Composting'
      },
      {
        id: 'v6',
        title: 'Vermicomposting: Composting with Worms',
        duration: '9:45',
        channel: 'Urban Farming',
        description: 'Learn how to use worms to speed up composting in small spaces.',
        videoUrl: 'https://www.youtube.com/watch?v=example6',
        thumbnailUrl: 'https://via.placeholder.com/320x180/65a30d/ffffff?text=Vermicomposting'
      }
    ],
    reduction: [
      {
        id: 'v7',
        title: 'Zero Waste Lifestyle: Getting Started',
        duration: '12:33',
        channel: 'Eco Living',
        description: 'Practical tips for reducing waste in your daily life.',
        videoUrl: 'https://www.youtube.com/watch?v=example7',
        thumbnailUrl: 'https://via.placeholder.com/320x180/8b5cf6/ffffff?text=Zero+Waste'
      }
    ],
    hazardous: [
      {
        id: 'v8',
        title: 'Safe Disposal of Electronic Waste',
        duration: '6:08',
        channel: 'Tech for Good',
        description: 'How to properly dispose of old electronics and batteries.',
        videoUrl: 'https://www.youtube.com/watch?v=example8',
        thumbnailUrl: 'https://via.placeholder.com/320x180/ef4444/ffffff?text=E-Waste+Disposal'
      }
    ],
    community: [
      {
        id: 'v9',
        title: 'Organizing Community Cleanup Events',
        duration: '10:25',
        channel: 'Community Action',
        description: 'Tips for planning successful neighborhood cleanup initiatives.',
        videoUrl: 'https://www.youtube.com/watch?v=example9',
        thumbnailUrl: 'https://via.placeholder.com/320x180/f97316/ffffff?text=Community+Cleanup'
      }
    ]
  };

  const articles: { [key: string]: Article[] } = {
    segregation: [
      {
        id: 1,
        title: 'Complete Guide to Waste Segregation',
        duration: '5 min read',
        level: 'Beginner',
        summary: 'Learn the basics of separating wet, dry, and hazardous waste at home',
        content: `Why Segregate Waste?

Proper waste segregation is the first step toward effective waste management. It helps in:
• Increasing recycling efficiency by 60%
• Reducing environmental pollution  
• Creating employment opportunities
• Generating useful products from waste

Types of Waste

Green Waste (Organic/Biodegradable):
• Fruit and vegetable peels
• Food leftovers
• Garden waste (leaves, flowers)
• Paper towels and tissues

Blue Waste (Recyclable):
• Paper and cardboard
• Plastic bottles and containers
• Glass items
• Metal cans and foil

Red Waste (Hazardous):
• Batteries and electronics
• Medical waste
• Paint and chemicals
• CFL bulbs and tubes

Best Practices:
1. Use separate colored bins for different types
2. Clean containers before disposal
3. Remove labels from bottles when possible
4. Never mix different types of waste`,
        tips: [
          'Use a small container for wet waste in your kitchen',
          'Rinse plastic containers before putting in dry waste',
          'Keep hazardous waste in a separate container'
        ],
        quiz: [
          {
            question: 'Where should food scraps go?',
            options: ['Wet waste bin', 'Dry waste bin', 'Hazardous waste bin'],
            correct: 0,
            explanation: 'Food scraps are organic waste that decomposes naturally, so they belong in wet waste bins.'
          }
        ],
        video: {
          id: 'v1',
          title: 'Waste Segregation Made Simple',
          duration: '6:42',
          channel: 'Environmental Education',
          description: 'Visual guide showing proper waste segregation techniques.',
          videoUrl: 'https://www.youtube.com/watch?v=6jQ7y_qQYUA',
          thumbnailUrl: 'https://via.placeholder.com/320x180/22c55e/ffffff?text=Waste+Segregation'
        }
      },
      {
        id: 2,
        title: 'Color Coding System for Bins',
        duration: '3 min read',
        level: 'Beginner',
        summary: 'Understanding the standard color codes for waste bins',
        content: `Standard Color Coding

Green Bin - Wet/Organic Waste:
All biodegradable kitchen and garden waste goes here.

Blue Bin - Dry/Recyclable Waste:
Clean paper, plastic, glass, and metal items.

Red Bin - Hazardous Waste:
Batteries, electronics, medical waste, chemicals.

Implementation Tips:
• Check your local municipality's specific color coding
• Label bins clearly if colors are not standard
• Teach family members the color system
• Place bins in convenient locations for easy access`,
        tips: [
          'Check your local municipality\'s specific color coding',
          'Label bins clearly if colors are not standard',
          'Teach family members the color system'
        ]
      }
    ],
    recycling: [
      {
        id: 3,
        title: '10 Creative Ways to Recycle Household Items',
        duration: '7 min read',
        level: 'Intermediate',
        summary: 'Transform waste into useful items with these creative recycling ideas',
        content: `Creative Recycling Ideas

Plastic Bottles:
• Cut and use as planters for herbs
• Create a bird feeder
• Make a piggy bank for kids
• Use as scoops for pet food or garden materials

Cardboard Boxes:
• Build storage organizers
• Create playhouses for children
• Make drawer dividers
• Use as gift boxes with decorative paper

Glass Jars:
• Store spices and dry goods
• Create luminaries with LED lights
• Make terrariums
• Use as bathroom organizers

Old T-shirts:
• Cut into cleaning rags
• Braid into rope or belts
• Use as plant ties in garden
• Create reusable shopping bags`,
        tips: [
          'Always clean items thoroughly before recycling',
          'Remove all labels and adhesive residue',
          'Check if your creativity can give items a second life before disposing'
        ],
        video: {
          id: 'v3',
          title: '15 Creative DIY Recycling Ideas',
          duration: '8:30',
          channel: 'DIY Sustainability',
          description: 'Watch step-by-step recycling projects you can do at home.',
          videoUrl: 'https://www.youtube.com/watch?v=example3',
          thumbnailUrl: 'https://via.placeholder.com/320x180/f59e0b/ffffff?text=DIY+Recycling'
        }
      }
    ],
    composting: [
      {
        id: 4,
        title: 'Home Composting: From Scraps to Soil',
        duration: '10 min read',
        level: 'Intermediate',
        summary: 'Step-by-step guide to creating nutrient-rich compost at home',
        content: `What is Composting?

Composting is the natural process of decomposing organic matter into nutrient-rich soil amendment. It reduces waste by up to 30% and creates valuable fertilizer for plants.

What to Compost

Greens (Nitrogen-rich):
• Fruit and vegetable scraps
• Coffee grounds and tea bags
• Fresh grass clippings
• Fresh garden waste

Browns (Carbon-rich):
• Dry leaves
• Newspaper and cardboard
• Straw and hay
• Wood chips

Composting Methods:
1. Traditional Compost Pile - Layer greens and browns in 3:1 ratio
2. Bin Composting - Use a contained system for smaller spaces
3. Vermicomposting - Use worms to speed up decomposition
4. Bokashi - Fermentation method for all food scraps

Timeline: Finished compost typically takes 3-6 months`,
        tips: [
          'Turn compost every 2-3 weeks for faster decomposition',
          'Keep compost moist but not waterlogged',
          'Add browns if compost smells bad'
        ],
        video: {
          id: 'v5',
          title: 'Home Composting for Beginners',
          duration: '7:18',
          channel: 'Garden Guru',
          description: 'See the composting process in action with practical demonstrations.',
          videoUrl: 'https://www.youtube.com/watch?v=example5',
          thumbnailUrl: 'https://via.placeholder.com/320x180/84cc16/ffffff?text=Home+Composting'
        }
      }
    ],
    reduction: [
      {
        id: 5,
        title: 'Zero Waste Lifestyle: A Beginner\'s Guide',
        duration: '8 min read',
        level: 'Beginner',
        summary: 'Simple steps to dramatically reduce household waste',
        content: `The 5 R's of Zero Waste

1. Refuse - Say no to what you don't need
2. Reduce - Minimize what you do need
3. Reuse - Find new purposes for items
4. Recycle - Process materials into new products
5. Rot - Compost organic materials

Kitchen Waste Reduction:
• Plan meals to reduce food waste
• Use reusable containers instead of plastic bags
• Buy in bulk to reduce packaging
• Preserve foods properly to extend shelf life

Bathroom Essentials:
• Switch to bar soaps instead of liquid soaps in plastic bottles
• Use bamboo toothbrushes
• Make your own cleaning products
• Use reusable cotton pads

Shopping Tips:
• Bring your own bags and containers
• Choose products with minimal packaging
• Buy local and seasonal produce
• Opt for quality items that last longer`,
        tips: [
          'Start with one room at a time',
          'Focus on reducing before reusing or recycling',
          'Track your waste for a week to identify patterns'
        ]
      }
    ],
    hazardous: [
      {
        id: 6,
        title: 'Safe Disposal of Hazardous Household Waste',
        duration: '6 min read',
        level: 'Intermediate',
        summary: 'Learn how to safely handle and dispose of dangerous household items',
        content: `Types of Hazardous Household Waste

Electronics: Phones, computers, batteries
Chemicals: Paints, solvents, pesticides
Medical: Needles, medicines, thermometers
Automotive: Oil, antifreeze, brake fluid

Safety Guidelines:
1. Never mix different chemicals
2. Keep items in original containers
3. Store in cool, dry places away from children
4. Don't put hazardous waste in regular bins

Disposal Options:
• Municipal hazardous waste collection days
• Retailer take-back programs
• Specialized disposal facilities
• Manufacturer recycling programs

Warning Signs:
Look for labels indicating: Toxic, Corrosive, Flammable, Reactive
These items require special handling and disposal`,
        tips: [
          'Check with local authorities for disposal schedules',
          'Many electronics stores accept old devices',
          'Never pour chemicals down drains or toilets'
        ]
      }
    ],
    community: [
      {
        id: 7,
        title: 'Organizing Community Cleanup Events',
        duration: '9 min read',
        level: 'Advanced',
        summary: 'Guide to planning and executing successful community waste management initiatives',
        content: `Planning Your Event

1. Choose a Location - Parks, beaches, neighborhoods
2. Set a Date - Consider weather and local schedules
3. Get Permits - Contact local authorities
4. Gather Supplies - Bags, gloves, pickup tools

Promoting Your Event:
• Use social media and community boards
• Partner with local organizations
• Contact local media for coverage
• Create eye-catching flyers

Day of the Event:
• Set up registration and supply stations
• Brief volunteers on safety procedures
• Document the event with photos
• Celebrate achievements with the group

Follow-up Actions:
• Share results and photos with participants
• Thank volunteers and sponsors
• Plan for regular maintenance
• Submit impact reports to local authorities`,
        tips: [
          'Start small with a manageable area',
          'Provide refreshments for volunteers',
          'Make it family-friendly to increase participation'
        ]
      }
    ]
  };

  const getCurrentArticles = () => articles[activeCategory] || [];
  const getCurrentVideos = () => videos[activeCategory] || [];

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers({ ...quizAnswers, [`q${questionIndex}`]: answerIndex });
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'leaf': return 'leaf';
      case 'sync': return 'sync';
      case 'flower': return 'flower';
      case 'trending-down': return 'trending-down';
      case 'warning': return 'warning';
      case 'people': return 'people';
      default: return 'help-circle';
    }
  };

  const openVideo = (videoUrl: string) => {
    Linking.openURL(videoUrl).catch(err => {
      console.error('Failed to open video:', err);
      if (Platform.OS === 'web') {
        alert('Unable to open video. Please check your internet connection.');
      }
    });
  };

  const renderTabSelector = () => (
    <View style={styles.tabSelector}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'articles' && styles.activeTabButton]}
        onPress={() => setActiveTab('articles')}
      >
        <Ionicons 
          name="document-text" 
          size={16} 
          color={activeTab === 'articles' ? '#ffffff' : theme.textSecondary} 
        />
        <Text style={[styles.tabButtonText, activeTab === 'articles' && styles.activeTabButtonText]}>
          Articles
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'videos' && styles.activeTabButton]}
        onPress={() => setActiveTab('videos')}
      >
        <Ionicons 
          name="play-circle" 
          size={16} 
          color={activeTab === 'videos' ? '#ffffff' : theme.textSecondary} 
        />
        <Text style={[styles.tabButtonText, activeTab === 'videos' && styles.activeTabButtonText]}>
          Videos
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderVideosList = () => (
    <View style={styles.articlesContainer}>
      <Text style={styles.sectionTitle}>
        {categories.find(c => c.id === activeCategory)?.name} Videos
      </Text>
      <Text style={styles.sectionDescription}>
        Watch educational videos to enhance your learning
      </Text>
      
      {getCurrentVideos().map((video) => (
        <TouchableOpacity
          key={video.id}
          style={styles.videoCard}
          onPress={() => openVideo(video.videoUrl)}
        >
          <View style={styles.videoThumbnail}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={32} color="#ffffff" />
            </View>
            <View style={styles.videoDurationBadge}>
              <Text style={styles.videoDurationText}>{video.duration}</Text>
            </View>
          </View>
          
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle}>{video.title}</Text>
            <Text style={styles.videoChannel}>{video.channel}</Text>
            <Text style={styles.videoDescription} numberOfLines={2}>{video.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
      
      {getCurrentVideos().length === 0 && (
        <View style={styles.noContent}>
          <Ionicons name="videocam-outline" size={48} color={theme.textSecondary} />
          <Text style={styles.noContentText}>No videos available for this category yet</Text>
        </View>
      )}
    </View>
  );

  const renderCategoryTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryTabs}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryTab,
            activeCategory === category.id && [styles.activeCategoryTab, { backgroundColor: category.color }]
          ]}
          onPress={() => setActiveCategory(category.id)}
        >
          <Ionicons 
            name={getCategoryIcon(category.icon) as any} 
            size={20} 
            color={activeCategory === category.id ? '#ffffff' : theme.textSecondary} 
          />
          <Text style={[
            styles.categoryTabText,
            activeCategory === category.id && { color: '#ffffff' }
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderArticlesList = () => (
    <View style={styles.articlesContainer}>
      <Text style={styles.sectionTitle}>
        {categories.find(c => c.id === activeCategory)?.name} Articles
      </Text>
      <Text style={styles.sectionDescription}>
        {categories.find(c => c.id === activeCategory)?.description}
      </Text>
      
      {getCurrentArticles().map((article) => (
        <TouchableOpacity
          key={article.id}
          style={styles.articleCard}
          onPress={() => setSelectedArticle(article)}
        >
          <View style={styles.articleHeader}>
            <Text style={styles.articleTitle}>{article.title}</Text>
            <View style={[
              styles.levelBadge,
              { backgroundColor: 
                article.level === 'Beginner' ? theme.success + '20' :
                article.level === 'Intermediate' ? theme.warning + '20' :
                theme.error + '20'
              }
            ]}>
              <Text style={[
                styles.levelBadgeText,
                { color: 
                  article.level === 'Beginner' ? theme.success :
                  article.level === 'Intermediate' ? theme.warning :
                  theme.error
                }
              ]}>
                {article.level}
              </Text>
            </View>
          </View>
          
          <Text style={styles.articleSummary}>{article.summary}</Text>
          
          <View style={styles.articleFooter}>
            <View style={styles.durationContainer}>
              <Ionicons name="time" size={14} color={theme.textSecondary} />
              <Text style={styles.durationText}>{article.duration}</Text>
            </View>
            {article.video && (
              <View style={styles.hasVideo}>
                <Ionicons name="videocam" size={14} color={theme.primary} />
                <Text style={styles.hasVideoText}>Video Available</Text>
              </View>
            )}
            <TouchableOpacity style={styles.readButton}>
              <Text style={styles.readButtonText}>Read Article</Text>
              <Ionicons name="chevron-forward" size={14} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderArticleView = () => (
    <ScrollView style={styles.articleView}>
      <View style={styles.articleViewHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedArticle(null)}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
          <Text style={styles.backButtonText}>Back to Articles</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.articleContent}>
        <Text style={styles.articleViewTitle}>{selectedArticle?.title}</Text>
        
        <View style={styles.articleMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={16} color={theme.textSecondary} />
            <Text style={styles.metaText}>{selectedArticle?.duration}</Text>
          </View>
          <View style={[
            styles.levelBadge,
            { backgroundColor: 
              selectedArticle?.level === 'Beginner' ? theme.success + '20' :
              selectedArticle?.level === 'Intermediate' ? theme.warning + '20' :
              theme.error + '20'
            }
          ]}>
            <Text style={[
              styles.levelBadgeText,
              { color: 
                selectedArticle?.level === 'Beginner' ? theme.success :
                selectedArticle?.level === 'Intermediate' ? theme.warning :
                theme.error
              }
            ]}>
              {selectedArticle?.level}
            </Text>
          </View>
        </View>

        <Text style={styles.articleSummary}>{selectedArticle?.summary}</Text>

        {/* Related Video Section */}
        {selectedArticle?.video && (
          <View style={styles.articleVideoSection}>
            <View style={styles.videoSectionHeader}>
              <Ionicons name="videocam" size={20} color={theme.primary} />
              <Text style={styles.videoSectionTitle}>Related Video</Text>
            </View>
            
            <TouchableOpacity
              style={styles.videoThumbnailInArticle}
              onPress={() => openVideo(selectedArticle.video!.videoUrl)}
            >
              <View style={styles.playButtonInArticle}>
                <Ionicons name="play" size={24} color="#ffffff" />
              </View>
              <View style={styles.videoDurationBadge}>
                <Text style={styles.videoDurationText}>{selectedArticle.video.duration}</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.videoInfoInArticle}>
              <Text style={styles.videoTitleInArticle}>{selectedArticle.video.title}</Text>
              <Text style={styles.videoDescriptionInArticle}>{selectedArticle.video.description}</Text>
            </View>
          </View>
        )}
        
        <Text style={styles.articleBodyText}>{selectedArticle?.content}</Text>

        {selectedArticle?.tips && (
          <View style={styles.tipsSection}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={20} color={theme.primary} />
              <Text style={styles.tipsTitle}>Pro Tips</Text>
            </View>
            {selectedArticle.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {selectedArticle?.quiz && (
          <View style={styles.quizSection}>
            <View style={styles.quizHeader}>
              <Ionicons name="help-circle" size={20} color={theme.success} />
              <Text style={styles.quizTitle}>Quick Quiz</Text>
            </View>
            
            {selectedArticle.quiz.map((question, qIndex) => (
              <View key={qIndex} style={styles.quizQuestion}>
                <Text style={styles.questionText}>{question.question}</Text>
                {question.options.map((option, oIndex) => (
                  <TouchableOpacity
                    key={oIndex}
                    style={[
                      styles.quizOption,
                      quizAnswers[`q${qIndex}`] === oIndex && styles.selectedQuizOption
                    ]}
                    onPress={() => handleQuizAnswer(qIndex, oIndex)}
                  >
                    <View style={[
                      styles.radioButton,
                      quizAnswers[`q${qIndex}`] === oIndex && styles.selectedRadioButton
                    ]} />
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            
            <TouchableOpacity style={styles.submitQuizButton}>
              <Text style={styles.submitQuizButtonText}>Check Answers</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Educational Hub</Text>
          <View style={styles.placeholder} />
        </View>

        {selectedArticle ? renderArticleView() : (
          <ScrollView style={styles.content}>
            {renderCategoryTabs()}
            {renderTabSelector()}
            {activeTab === 'articles' ? renderArticlesList() : renderVideosList()}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  categoryTabs: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
  },
  activeCategoryTab: {
    borderColor: 'transparent',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: theme.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  activeTabButtonText: {
    color: '#ffffff',
  },
  articlesContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 20,
  },
  articleCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  videoCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDurationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoDurationText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 6,
  },
  videoChannel: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '500',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  noContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noContentText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
    marginRight: 12,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  articleSummary: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  hasVideo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hasVideoText: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '500',
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.primary,
  },
  articleView: {
    flex: 1,
  },
  articleViewHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: theme.text,
  },
  articleContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  articleViewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  articleVideoSection: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  videoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    paddingBottom: 12,
  },
  videoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
  },
  videoThumbnailInArticle: {
    width: '100%',
    height: 180,
    backgroundColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playButtonInArticle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfoInArticle: {
    padding: 16,
    paddingTop: 12,
  },
  videoTitleInArticle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  videoDescriptionInArticle: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 16,
  },
  articleBodyText: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 24,
    marginBottom: 24,
  },
  tipsSection: {
    backgroundColor: theme.primary + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  tipBullet: {
    fontSize: 16,
    color: theme.primary,
    marginRight: 8,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 14,
    color: theme.text,
    flex: 1,
    lineHeight: 20,
  },
  quizSection: {
    backgroundColor: theme.success + '20',
    borderRadius: 12,
    padding: 16,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.success,
  },
  quizQuestion: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 12,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  selectedQuizOption: {
    backgroundColor: theme.success + '10',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.border,
  },
  selectedRadioButton: {
    backgroundColor: theme.success,
    borderColor: theme.success,
  },
  optionText: {
    fontSize: 14,
    color: theme.text,
    flex: 1,
  },
  submitQuizButton: {
    backgroundColor: theme.success,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitQuizButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

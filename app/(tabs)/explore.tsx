import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert, 
  Platform, 
  Modal, 
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userLevel: string;
  userAvatar: string;
  type: 'achievement' | 'tip' | 'event' | 'challenge';
  title: string;
  description: string;
  imageUri?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  badge?: string;
  likedBy: string[];
  category: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  progress: number;
  completed: boolean;
  pointsReward: number;
  category: 'reports' | 'points' | 'streak' | 'social';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'event';
  startDate: string;
  endDate: string;
  participants: number;
  reward: string;
  progress: number;
  target: number;
  isActive: boolean;
}

export default function CommunityScreen() {
  const { theme, isDark } = useTheme();
  const { user, reports } = useData();
  const styles = createStyles(theme);
  
  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard' | 'achievements' | 'challenges'>('feed');
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  const [newPost, setNewPost] = useState({
    type: 'tip' as 'achievement' | 'tip' | 'event' | 'challenge',
    title: '',
    description: '',
    category: 'general'
  });

  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: 'p1',
      userId: 'user1',
      userName: 'Sarah Green',
      userLevel: 'Eco Champion',
      userAvatar: 'leaf',
      type: 'achievement',
      title: 'Reached 50 Reports Milestone!',
      description: 'Just submitted my 50th waste report! Every small action counts towards a cleaner city. Keep reporting everyone!',
      imageUri: 'https://via.placeholder.com/300x200/22c55e/ffffff?text=50+Reports',
      likes: 24,
      comments: 8,
      shares: 3,
      timestamp: '2 hours ago',
      badge: '50 Reports',
      likedBy: [],
      category: 'milestone'
    },
    {
      id: 'p2',
      userId: 'user2',
      userName: 'Mike Chen',
      userLevel: 'Green Warrior',
      userAvatar: 'recycle',
      type: 'tip',
      title: 'Pro Tip: Best Times for Reporting',
      description: 'I\'ve found that reporting waste issues early morning (7-9 AM) gets the fastest response from cleanup crews. They check the app before starting their routes!',
      likes: 18,
      comments: 5,
      shares: 12,
      timestamp: '4 hours ago',
      likedBy: [],
      category: 'tips'
    },
    {
      id: 'p3',
      userId: user?.id || 'demo-user-id',
      userName: user?.name || 'Demo User',
      userLevel: user?.level || 'Eco Warrior',
      userAvatar: 'person',
      type: 'achievement',
      title: 'Started My Eco Journey',
      description: 'Just joined Bin2Win! Excited to contribute to a cleaner community. Looking forward to making a difference!',
      likes: 15,
      comments: 3,
      shares: 1,
      timestamp: '1 day ago',
      badge: 'New Member',
      likedBy: [],
      category: 'welcome'
    }
  ]);

  // Generate achievements based on user data
  const achievements: Achievement[] = [
    {
      id: 'first_report',
      name: 'First Reporter',
      description: 'Submit your first waste report',
      icon: 'flag',
      requirement: 1,
      progress: reports.length,
      completed: reports.length >= 1,
      pointsReward: 10,
      category: 'reports'
    },
    {
      id: 'eco_warrior',
      name: 'Eco Warrior',
      description: 'Submit 10 waste reports',
      icon: 'shield',
      requirement: 10,
      progress: reports.length,
      completed: reports.length >= 10,
      pointsReward: 50,
      category: 'reports'
    },
    {
      id: 'point_collector',
      name: 'Point Collector',
      description: 'Earn 100 points',
      icon: 'star',
      requirement: 100,
      progress: user?.points || 0,
      completed: (user?.points || 0) >= 100,
      pointsReward: 25,
      category: 'points'
    },
    {
      id: 'community_helper',
      name: 'Community Helper',
      description: 'Share 5 tips with the community',
      icon: 'people',
      requirement: 5,
      progress: posts.filter(p => p.userId === user?.id && p.type === 'tip').length,
      completed: posts.filter(p => p.userId === user?.id && p.type === 'tip').length >= 5,
      pointsReward: 30,
      category: 'social'
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      description: 'Report waste for 7 consecutive days',
      icon: 'flame',
      requirement: 7,
      progress: 3, // This would be calculated from actual report dates
      completed: false,
      pointsReward: 75,
      category: 'streak'
    }
  ];

  const challenges: Challenge[] = [
    {
      id: 'weekly_cleanup',
      title: 'Weekly Cleanup Challenge',
      description: 'Report 5 waste issues this week to help clean up the community',
      type: 'weekly',
      startDate: '2025-09-21',
      endDate: '2025-09-28',
      participants: 156,
      reward: '50 bonus points + Eco Badge',
      progress: reports.length,
      target: 5,
      isActive: true
    },
    {
      id: 'earth_month',
      title: 'Earth Month Initiative',
      description: 'Community goal: 1000 reports this month for a cleaner environment',
      type: 'monthly',
      startDate: '2025-09-01',
      endDate: '2025-09-30',
      participants: 1247,
      reward: 'Special Earth Badge for all participants',
      progress: 687,
      target: 1000,
      isActive: true
    }
  ];

  // Mock leaderboard - in real app this would come from backend
  const leaderboard = [
    { 
      rank: 1, 
      userId: 'user1', 
      name: 'Sarah Green', 
      points: 1250, 
      reports: 62, 
      level: 'Eco Champion', 
      avatar: 'leaf',
      trend: 'up' 
    },
    { 
      rank: 2, 
      userId: 'user2', 
      name: 'Mike Chen', 
      points: 1100, 
      reports: 58, 
      level: 'Green Warrior', 
      avatar: 'recycle',
      trend: 'up' 
    },
    { 
      rank: 3, 
      userId: 'user3', 
      name: 'Lisa Park', 
      points: 950, 
      reports: 45, 
      level: 'Sustainability Expert', 
      avatar: 'trophy',
      trend: 'down' 
    },
    { 
      rank: Math.min(4 + Math.floor(Math.random() * 50), 100), 
      userId: user?.id || 'demo-user-id', 
      name: user?.name || 'You', 
      points: user?.points || 0, 
      reports: reports.length, 
      level: user?.level || 'New User', 
      avatar: 'person',
      trend: 'up' 
    }
  ];

  const handleLike = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = post.likedBy.includes(user?.id || '');
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            likedBy: isLiked 
              ? post.likedBy.filter(id => id !== user?.id)
              : [...post.likedBy, user?.id || '']
          };
        }
        return post;
      })
    );
  };

  const handleShare = (post: CommunityPost) => {
    if (Platform.OS === 'web') {
      if (navigator.share) {
        navigator.share({
          title: post.title,
          text: post.description,
          url: window.location.href
        });
      } else {
        alert(`Shared: ${post.title}`);
      }
    } else {
      Alert.alert('Share', `Share "${post.title}" functionality would be implemented here`);
    }
  };

  const handlePostSubmit = () => {
    if (!newPost.title || !newPost.description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const post: CommunityPost = {
      id: `p_${Date.now()}`,
      userId: user?.id || 'demo-user-id',
      userName: user?.name || 'Demo User',
      userLevel: user?.level || 'Eco Warrior',
      userAvatar: 'person',
      type: newPost.type,
      title: newPost.title,
      description: newPost.description,
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: 'now',
      likedBy: [],
      category: newPost.category
    };

    setPosts([post, ...posts]);
    setNewPost({ type: 'tip', title: '', description: '', category: 'general' });
    setShowPostModal(false);
    
    Alert.alert('Success', 'Your post has been shared with the community!');
  };

  const renderFeedTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.feedHeader}>
          <Text style={styles.sectionTitle}>Community Feed</Text>
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={() => setShowPostModal(true)}
          >
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text style={styles.createPostButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.postsContainer}>
          {posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Ionicons name={post.userAvatar as any} size={20} color={theme.primary} />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{post.userName}</Text>
                    <Text style={styles.userLevel}>{post.userLevel}</Text>
                    <Text style={styles.postTime}>{post.timestamp}</Text>
                  </View>
                </View>
                <View style={styles.postMeta}>
                  <View style={styles.postTypeChip}>
                    <Ionicons 
                      name={post.type === 'achievement' ? 'trophy' : 
                            post.type === 'tip' ? 'bulb' : 
                            post.type === 'event' ? 'calendar' : 'ribbon'} 
                      size={12} 
                      color={theme.primary} 
                    />
                    <Text style={styles.postTypeText}>{post.type}</Text>
                  </View>
                  {post.badge && (
                    <View style={styles.achievementBadge}>
                      <Text style={styles.badgeText}>{post.badge}</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postDescription}>{post.description}</Text>

              {post.imageUri && (
                <Image source={{ uri: post.imageUri }} style={styles.postImage} />
              )}

              <View style={styles.postActions}>
                <TouchableOpacity
                  style={[styles.actionButton, post.likedBy.includes(user?.id || '') && styles.likedButton]}
                  onPress={() => handleLike(post.id)}
                >
                  <Ionicons 
                    name={post.likedBy.includes(user?.id || '') ? 'heart' : 'heart-outline'} 
                    size={18} 
                    color={post.likedBy.includes(user?.id || '') ? theme.error : theme.textSecondary} 
                  />
                  <Text style={[styles.actionText, post.likedBy.includes(user?.id || '') && { color: theme.error }]}>
                    {post.likes}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={18} color={theme.textSecondary} />
                  <Text style={styles.actionText}>{post.comments}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleShare(post)}
                >
                  <Ionicons name="share-outline" size={18} color={theme.textSecondary} />
                  <Text style={styles.actionText}>{post.shares}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderLeaderboardTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Community Leaderboard</Text>
        <Text style={styles.sectionSubtitle}>Top eco-warriors making a difference</Text>
        
        <View style={styles.leaderboardContainer}>
          {leaderboard
            .sort((a, b) => b.points - a.points)
            .map((user, index) => {
              const actualRank = index + 1;
              const isCurrentUser = user.userId === (user?.id || 'demo-user-id');
              
              return (
                <View
                  key={user.userId}
                  style={[
                    styles.leaderboardItem,
                    isCurrentUser && styles.currentUserItem,
                    actualRank <= 3 && styles.topThreeItem
                  ]}
                >
                  <View style={styles.rankContainer}>
                    <Text style={[
                      styles.rank,
                      actualRank === 1 && { color: '#ffd700' },
                      actualRank === 2 && { color: '#c0c0c0' },
                      actualRank === 3 && { color: '#cd7f32' }
                    ]}>
                      #{actualRank}
                    </Text>
                    {actualRank <= 3 && (
                      <Ionicons
                        name={actualRank === 1 ? 'trophy' : actualRank === 2 ? 'medal' : 'ribbon'}
                        size={16}
                        color={actualRank === 1 ? '#ffd700' : actualRank === 2 ? '#c0c0c0' : '#cd7f32'}
                      />
                    )}
                  </View>
                  
                  <View style={styles.leaderAvatar}>
                    <Ionicons name={user.avatar as any} size={20} color={theme.primary} />
                  </View>
                  
                  <View style={styles.leaderInfo}>
                    <View style={styles.leaderNameRow}>
                      <Text style={[styles.leaderName, isCurrentUser && { color: theme.primary }]}>
                        {user.name}
                      </Text>
                      <Ionicons 
                        name={user.trend === 'up' ? 'trending-up' : 'trending-down'} 
                        size={12} 
                        color={user.trend === 'up' ? theme.success : theme.error} 
                      />
                    </View>
                    <Text style={styles.leaderLevel}>{user.level}</Text>
                  </View>
                  
                  <View style={styles.leaderStats}>
                    <Text style={styles.leaderPoints}>{user.points} pts</Text>
                    <Text style={styles.leaderReports}>{user.reports} reports</Text>
                  </View>
                </View>
              );
            })}
        </View>
      </View>
    </ScrollView>
  );

  const renderAchievementsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <Text style={styles.sectionSubtitle}>Unlock badges by completing challenges</Text>
        
        <View style={styles.achievementStats}>
          <View style={styles.achievementStat}>
            <Text style={styles.statNumber}>{achievements.filter(a => a.completed).length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.achievementStat}>
            <Text style={styles.statNumber}>{achievements.length - achievements.filter(a => a.completed).length}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.achievementStat}>
            <Text style={styles.statNumber}>{achievements.reduce((sum, a) => a.completed ? sum + a.pointsReward : sum, 0)}</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
        </View>

        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              style={[
                styles.achievementCard,
                achievement.completed && styles.completedAchievement
              ]}
              onPress={() => {
                setSelectedAchievement(achievement);
                setShowAchievementModal(true);
              }}
            >
              <View style={styles.achievementHeader}>
                <View style={[
                  styles.achievementIcon,
                  achievement.completed && { backgroundColor: theme.success + '20' }
                ]}>
                  <Ionicons 
                    name={achievement.icon as any} 
                    size={24} 
                    color={achievement.completed ? theme.success : theme.textSecondary} 
                  />
                </View>
                {achievement.completed && (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark" size={12} color="#ffffff" />
                  </View>
                )}
              </View>
              
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementDescription} numberOfLines={2}>
                {achievement.description}
              </Text>
              
              <View style={styles.achievementProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${Math.min((achievement.progress / achievement.requirement) * 100, 100)}%`,
                        backgroundColor: achievement.completed ? theme.success : theme.primary
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.min(achievement.progress, achievement.requirement)}/{achievement.requirement}
                </Text>
              </View>
              
              <View style={styles.achievementReward}>
                <Ionicons name="star" size={12} color={theme.warning} />
                <Text style={styles.rewardText}>{achievement.pointsReward} pts</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderChallengesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Community Challenges</Text>
        <Text style={styles.sectionSubtitle}>Join active challenges and earn rewards</Text>
        
        <View style={styles.challengesContainer}>
          {challenges.map((challenge) => (
            <View key={challenge.id} style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <View>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <View style={styles.challengeTypeChip}>
                    <Ionicons 
                      name={challenge.type === 'weekly' ? 'calendar' : 
                            challenge.type === 'monthly' ? 'calendar-outline' : 'flash'} 
                      size={12} 
                      color={theme.primary} 
                    />
                    <Text style={styles.challengeTypeText}>{challenge.type}</Text>
                  </View>
                </View>
                <View style={[styles.challengeStatus, challenge.isActive && { backgroundColor: theme.success + '20' }]}>
                  <Text style={[styles.challengeStatusText, challenge.isActive && { color: theme.success }]}>
                    {challenge.isActive ? 'Active' : 'Ended'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
              
              <View style={styles.challengeProgress}>
                <View style={styles.challengeProgressHeader}>
                  <Text style={styles.challengeProgressLabel}>Progress</Text>
                  <Text style={styles.challengeProgressValue}>
                    {challenge.progress}/{challenge.target}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%`,
                        backgroundColor: theme.primary
                      }
                    ]} 
                  />
                </View>
              </View>
              
              <View style={styles.challengeFooter}>
                <View style={styles.challengeParticipants}>
                  <Ionicons name="people" size={14} color={theme.textSecondary} />
                  <Text style={styles.participantsText}>{challenge.participants} participants</Text>
                </View>
                <View style={styles.challengeReward}>
                  <Ionicons name="gift" size={14} color={theme.warning} />
                  <Text style={styles.challengeRewardText}>{challenge.reward}</Text>
                </View>
              </View>
              
              {challenge.isActive && (
                <TouchableOpacity style={styles.joinChallengeButton}>
                  <Text style={styles.joinChallengeButtonText}>
                    {challenge.progress > 0 ? 'Continue Challenge' : 'Join Challenge'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderCreatePostModal = () => (
    <Modal
      visible={showPostModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowPostModal(false)}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Share with Community</Text>
          <TouchableOpacity onPress={handlePostSubmit}>
            <Text style={[styles.modalAction, { color: theme.primary }]}>Share</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.postTypeSelector}>
            <Text style={styles.formLabel}>Post Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.postTypeOptions}>
                {[
                  { key: 'tip', label: 'Share Tip', icon: 'bulb' },
                  { key: 'achievement', label: 'Achievement', icon: 'trophy' },
                  { key: 'event', label: 'Event', icon: 'calendar' },
                  { key: 'challenge', label: 'Challenge', icon: 'ribbon' }
                ].map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.postTypeOption,
                      newPost.type === type.key && styles.selectedPostType
                    ]}
                    onPress={() => setNewPost({...newPost, type: type.key as any})}
                  >
                    <Ionicons 
                      name={type.icon as any} 
                      size={16} 
                      color={newPost.type === type.key ? '#ffffff' : theme.textSecondary} 
                    />
                    <Text style={[
                      styles.postTypeOptionText,
                      newPost.type === type.key && styles.selectedPostTypeText
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Title</Text>
            <TextInput
              style={styles.formInput}
              placeholder="What would you like to share?"
              value={newPost.title}
              onChangeText={(value) => setNewPost({...newPost, title: value})}
              maxLength={100}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              placeholder="Share details, tips, or your experience..."
              value={newPost.description}
              onChangeText={(value) => setNewPost({...newPost, description: value})}
              multiline
              numberOfLines={6}
              maxLength={500}
            />
            <Text style={styles.characterCount}>
              {newPost.description.length}/500 characters
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderAchievementModal = () => (
    <Modal
      visible={showAchievementModal}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.achievementModalOverlay}>
        <View style={styles.achievementModalContent}>
          <TouchableOpacity
            style={styles.achievementModalClose}
            onPress={() => setShowAchievementModal(false)}
          >
            <Ionicons name="close" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          
          {selectedAchievement && (
            <>
              <View style={[
                styles.achievementModalIcon,
                selectedAchievement.completed && { backgroundColor: theme.success + '20' }
              ]}>
                <Ionicons 
                  name={selectedAchievement.icon as any} 
                  size={48} 
                  color={selectedAchievement.completed ? theme.success : theme.textSecondary} 
                />
              </View>
              
              <Text style={styles.achievementModalTitle}>{selectedAchievement.name}</Text>
              <Text style={styles.achievementModalDescription}>
                {selectedAchievement.description}
              </Text>
              
              <View style={styles.achievementModalProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${Math.min((selectedAchievement.progress / selectedAchievement.requirement) * 100, 100)}%`,
                        backgroundColor: selectedAchievement.completed ? theme.success : theme.primary
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.achievementModalProgressText}>
                  {Math.min(selectedAchievement.progress, selectedAchievement.requirement)}/{selectedAchievement.requirement}
                  {selectedAchievement.completed ? ' - Completed!' : ''}
                </Text>
              </View>
              
              <View style={styles.achievementModalReward}>
                <Ionicons name="star" size={16} color={theme.warning} />
                <Text style={styles.achievementModalRewardText}>
                  Reward: {selectedAchievement.pointsReward} points
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>Connect with eco-warriors</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
          onPress={() => setActiveTab('feed')}
        >
          <Ionicons 
            name="newspaper" 
            size={18} 
            color={activeTab === 'feed' ? '#ffffff' : theme.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>
            Feed
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Ionicons 
            name="trophy" 
            size={18} 
            color={activeTab === 'leaderboard' ? '#ffffff' : theme.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>
            Leaders
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
          onPress={() => setActiveTab('achievements')}
        >
          <Ionicons 
            name="medal" 
            size={18} 
            color={activeTab === 'achievements' ? '#ffffff' : theme.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}>
            Badges
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
          onPress={() => setActiveTab('challenges')}
        >
          <Ionicons 
            name="flash" 
            size={18} 
            color={activeTab === 'challenges' ? '#ffffff' : theme.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>
            Challenges
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'feed' && renderFeedTab()}
      {activeTab === 'leaderboard' && renderLeaderboardTab()}
      {activeTab === 'achievements' && renderAchievementsTab()}
      {activeTab === 'challenges' && renderChallengesTab()}

      {/* Modals */}
      {renderCreatePostModal()}
      {renderAchievementModal()}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#6366f1',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#c7d2fe',
    textAlign: 'center',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  createPostButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  createPostButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  postsContainer: {
    gap: 16,
  },
  postCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  userLevel: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  postTime: {
    fontSize: 10,
    color: theme.textSecondary,
    marginTop: 2,
  },
  postMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  postTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  postTypeText: {
    fontSize: 10,
    color: theme.primary,
    fontWeight: '500',
  },
  achievementBadge: {
    backgroundColor: theme.warning + '30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.warning,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 6,
  },
  postDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likedButton: {
    opacity: 1,
  },
  actionText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  leaderboardContainer: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: theme.primary,
    backgroundColor: theme.primary + '10',
  },
  topThreeItem: {
    backgroundColor: theme.warning + '10',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 50,
    gap: 4,
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  leaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  leaderLevel: {
    fontSize: 11,
    color: theme.textSecondary,
    marginTop: 1,
  },
  leaderStats: {
    alignItems: 'flex-end',
  },
  leaderPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.success,
  },
  leaderReports: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  achievementStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  achievementStat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  statLabel: {
    fontSize: 11,
    color: theme.textSecondary,
    marginTop: 2,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '47%',
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  completedAchievement: {
    borderWidth: 1,
    borderColor: theme.success,
    backgroundColor: theme.success + '05',
  },
  achievementHeader: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: '30%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 11,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
  },
  achievementProgress: {
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  achievementReward: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  rewardText: {
    fontSize: 10,
    color: theme.warning,
    fontWeight: '500',
  },
  challengesContainer: {
    gap: 16,
  },
  challengeCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  challengeTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  challengeTypeText: {
    fontSize: 10,
    color: theme.primary,
    fontWeight: '500',
  },
  challengeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.border,
  },
  challengeStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  challengeDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  challengeProgress: {
    marginBottom: 12,
  },
  challengeProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  challengeProgressLabel: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  challengeProgressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantsText: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeRewardText: {
    fontSize: 11,
    color: theme.warning,
    fontWeight: '500',
  },
  joinChallengeButton: {
    backgroundColor: theme.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinChallengeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  modalAction: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  postTypeSelector: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  postTypeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  postTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  selectedPostType: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  postTypeOptionText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  selectedPostTypeText: {
    color: '#ffffff',
  },
  formGroup: {
    marginBottom: 20,
  },
  formInput: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 11,
    color: theme.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  achievementModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  achievementModalContent: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    minWidth: 280,
    position: 'relative',
  },
  achievementModalClose: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  achievementModalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  achievementModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementModalDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  achievementModalProgress: {
    width: '100%',
    marginBottom: 16,
  },
  achievementModalProgressText: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  achievementModalReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  achievementModalRewardText: {
    fontSize: 14,
    color: theme.warning,
    fontWeight: '600',
  },
});

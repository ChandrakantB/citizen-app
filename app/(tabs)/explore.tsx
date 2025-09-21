import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function CommunityScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const [activeTab, setActiveTab] = useState('posts');

  // Dummy community data
  const communityPosts = [
    {
      id: 1,
      user: { name: 'Sarah Green', avatar: '🌱', level: 'Eco Champion' },
      type: 'achievement',
      title: 'Completed 50 waste reports!',
      description: 'Just hit my milestone of 50 waste reports submitted. Every small action counts towards a cleaner city! 🌍',
      image: 'https://via.placeholder.com/300x200/22c55e/ffffff?text=Achievement',
      likes: 24,
      comments: 8,
      time: '2 hours ago',
      badge: '50 Reports'
    },
    {
      id: 2,
      user: { name: 'Mike Chen', avatar: '♻️', level: 'Green Warrior' },
      type: 'post',
      title: 'DIY Compost Bin Setup',
      description: 'Just set up my home composting system! Sharing some tips for fellow eco-warriors. Reducing kitchen waste by 80%!',
      image: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Compost+Setup',
      likes: 18,
      comments: 5,
      time: '4 hours ago',
      badge: null
    },
    {
      id: 3,
      user: { name: 'Lisa Park', avatar: '🏆', level: 'Sustainability Expert' },
      type: 'achievement',
      title: 'Earned 1000 points!',
      description: 'Reached 1000 eco-points through consistent waste reporting and community participation. Thanks to everyone for the support!',
      image: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=1000+Points',
      likes: 35,
      comments: 12,
      time: '6 hours ago',
      badge: '1K Points'
    },
    {
      id: 4,
      user: { name: 'David Kumar', avatar: '🌳', level: 'Tree Hugger' },
      type: 'post',
      title: 'Neighborhood Cleanup Drive',
      description: 'Organizing a community cleanup this weekend! Join us at Central Park, 9 AM. Let\'s make our neighborhood beautiful together!',
      image: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Cleanup+Drive',
      likes: 42,
      comments: 15,
      time: '8 hours ago',
      badge: null
    }
  ];

  const leaderboard = [
    { name: 'Sarah Green', points: 1250, reports: 62, level: 'Eco Champion', avatar: '🌱' },
    { name: 'Lisa Park', points: 1100, reports: 58, level: 'Sustainability Expert', avatar: '🏆' },
    { name: 'Mike Chen', points: 950, reports: 45, level: 'Green Warrior', avatar: '♻️' },
    { name: 'David Kumar', points: 875, reports: 41, level: 'Tree Hugger', avatar: '🌳' },
    { name: 'You', points: 85, reports: 12, level: 'Eco Warrior', avatar: '🍃' },
  ];

  const handleLike = (postId: number) => {
    Alert.alert('Liked!', 'You liked this post');
  };

  const handleComment = (postId: number) => {
    Alert.alert('Comment', 'Comment feature coming soon!');
  };

  const handleCreatePost = () => {
    Alert.alert('Create Post', 'Share your eco-achievements and tips with the community!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>Share your eco journey</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreatePost}>
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.createButtonText}>Share Achievement</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Community Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
            onPress={() => setActiveTab('leaderboard')}
          >
            <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>
              Leaderboard
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {activeTab === 'posts' ? (
            /* Community Posts */
            <View>
              {communityPosts.map((post) => (
                <View key={post.id} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userAvatar}>{post.user.avatar}</Text>
                      <View style={styles.userDetails}>
                        <Text style={styles.userName}>{post.user.name}</Text>
                        <Text style={styles.userLevel}>{post.user.level}</Text>
                      </View>
                    </View>
                    <View style={styles.postMeta}>
                      <Text style={styles.postTime}>{post.time}</Text>
                      {post.badge && (
                        <View style={styles.achievementBadge}>
                          <Text style={styles.badgeText}>{post.badge}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postDescription}>{post.description}</Text>

                  <Image source={{ uri: post.image }} style={styles.postImage} />

                  <View style={styles.postActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleLike(post.id)}
                    >
                      <Ionicons name="heart-outline" size={20} color={theme.textSecondary} />
                      <Text style={styles.actionText}>{post.likes} likes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleComment(post.id)}
                    >
                      <Ionicons name="chatbubble-outline" size={20} color={theme.textSecondary} />
                      <Text style={styles.actionText}>{post.comments} comments</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="share-outline" size={20} color={theme.textSecondary} />
                      <Text style={styles.actionText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            /* Leaderboard */
            <View>
              <Text style={styles.sectionTitle}>Top Eco Warriors</Text>
              {leaderboard.map((user, index) => (
                <View
                  key={index}
                  style={[
                    styles.leaderboardItem,
                    user.name === 'You' && styles.currentUserItem
                  ]}
                >
                  <View style={styles.rankContainer}>
                    <Text style={styles.rank}>#{index + 1}</Text>
                    {index < 3 && (
                      <Ionicons
                        name={index === 0 ? 'trophy' : index === 1 ? 'medal' : 'ribbon'}
                        size={20}
                        color={index === 0 ? theme.warning : index === 1 ? theme.textSecondary : '#cd7c2f'}
                      />
                    )}
                  </View>
                  
                  <Text style={styles.leaderAvatar}>{user.avatar}</Text>
                  
                  <View style={styles.leaderInfo}>
                    <Text style={[styles.leaderName, user.name === 'You' && styles.currentUserName]}>
                      {user.name}
                    </Text>
                    <Text style={styles.leaderLevel}>{user.level}</Text>
                  </View>
                  
                  <View style={styles.leaderStats}>
                    <Text style={styles.leaderPoints}>{user.points} pts</Text>
                    <Text style={styles.leaderReports}>{user.reports} reports</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#c7d2fe',
    textAlign: 'center',
    marginBottom: 15,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 6,
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
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 16,
  },
  postCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  },
  userAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  userLevel: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  postMeta: {
    alignItems: 'flex-end',
  },
  postTime: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  achievementBadge: {
    backgroundColor: theme.warning + '30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
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
  },
  actionText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginLeft: 4,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
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
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
    marginRight: 12,
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginRight: 4,
  },
  leaderAvatar: {
    fontSize: 20,
    marginRight: 12,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  currentUserName: {
    color: theme.primary,
  },
  leaderLevel: {
    fontSize: 12,
    color: theme.textSecondary,
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
});

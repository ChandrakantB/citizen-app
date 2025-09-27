import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { apiService } from '../../sevices/apiService';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  imageUrl?: string;
  timestamp: Date;
  classification?: {
    category: string;
    subCategory: string;
    isRecyclable: boolean;
    recyclingInstructions: string;
    reasoning: string;
  };
  isLoading?: boolean;
}

interface HistoryItem {
  _id: string;
  imageUrl: string;
  classification: {
    category: string;
    subCategory: string;
    isRecyclable: boolean;
    recyclingInstructions: string;
    reasoning: string;
  };
  createdAt: string;
}

const { width, height } = Dimensions.get('window');

export default function GreenMitraTab() {
  const { theme } = useTheme();
  const { user } = useData();
  const styles = createStyles(theme);
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: "🌱 Namaste! I'm GreenMitra, your AI waste classification assistant! \n\n💬 Send me text describing any waste item\n📸 Or send a photo of waste\n🤖 I'll help you classify and dispose it correctly!",
      timestamp: new Date(),
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setRefreshing(true);
      const response = await apiService.getWasteHistory(1, 50);
      if (response.data) {
        setHistory(response.data);
      }
    } catch (error) {
      console.log('⚠️ Failed to load history:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const sendMessage = async (text?: string, imageUri?: string) => {
    if (!text && !imageUri) return;
    if (isLoading) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: text || 'Sent an image',
      imageUrl: imageUri,
      timestamp: new Date(),
    };

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      message: '🤖 Analyzing your request...',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await apiService.classifyWasteWithAI({
        prompt: text,
        imageFile: imageUri,
      });

      // Remove loading message and add bot response
      setMessages(prev => {
        const newMessages = prev.filter(msg => !msg.isLoading);
        
        const botMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          message: response.aiAnswer || 'Classification completed!',
          timestamp: new Date(),
          classification: response.savedItem?.classification,
          imageUrl: response.savedItem?.imageUrl,
        };

        return [...newMessages, botMessage];
      });

      // Refresh history after new classification
      loadHistory();

    } catch (error) {
      console.error('❌ GreenMitra error:', error);
      
      // Remove loading message and add error message
      setMessages(prev => {
        const newMessages = prev.filter(msg => !msg.isLoading);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          message: '😔 Sorry, I encountered an error while analyzing your request. Please try again!',
          timestamp: new Date(),
        };

        return [...newMessages, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    if (isLoading) return;

    if (Platform.OS === 'web') {
      const demoImageUrl = "https://via.placeholder.com/300x200/22c55e/ffffff?text=Demo+Waste+Image";
      await sendMessage('Please classify this waste item', demoImageUrl);
      return;
    }

    Alert.alert(
      "Add Image",
      "Choose how to add an image:",
      [
        { text: "Camera", onPress: () => openCamera() },
        { text: "Gallery", onPress: () => openGallery() },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      await sendMessage(inputText || 'Please classify this waste item', result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery access is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      await sendMessage(inputText || 'Please classify this waste item', result.assets[0].uri);
    }
  };

  const renderClassificationCard = (classification: any) => (
    <View style={styles.classificationCard}>
      <View style={styles.classificationHeader}>
        <View style={[
          styles.categoryBadge,
          { backgroundColor: classification.isRecyclable ? '#10B981' : '#EF4444' }
        ]}>
          <Ionicons 
            name={classification.isRecyclable ? "checkmark-circle" : "close-circle"} 
            size={16} 
            color="#fff" 
          />
          <Text style={styles.categoryText}>
            {classification.isRecyclable ? 'Recyclable' : 'Non-Recyclable'}
          </Text>
        </View>
      </View>
      
      <View style={styles.classificationContent}>
        <Text style={styles.categoryLabel}>📋 Category:</Text>
        <Text style={styles.categoryValue}>{classification.category}</Text>
        
        {classification.subCategory !== 'Uncertain' && (
          <>
            <Text style={styles.categoryLabel}>🏷️ Sub-Category:</Text>
            <Text style={styles.categoryValue}>{classification.subCategory}</Text>
          </>
        )}
        
        <Text style={styles.categoryLabel}>♻️ Instructions:</Text>
        <Text style={styles.instructionsText}>{classification.recyclingInstructions}</Text>
        
        <Text style={styles.categoryLabel}>🤖 AI Reasoning:</Text>
        <Text style={styles.reasoningText}>{classification.reasoning}</Text>
      </View>
    </View>
  );

  const renderMessage = (message: ChatMessage) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.type === 'user' ? styles.userMessage : styles.botMessage,
      ]}
    >
      {message.type === 'bot' && (
        <View style={styles.botAvatar}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.avatarGradient}
          >
            {message.isLoading ? (
              <MaterialCommunityIcons name="loading" size={20} color="#fff" />
            ) : (
              <Ionicons name="leaf" size={20} color="#fff" />
            )}
          </LinearGradient>
        </View>
      )}
      
      <View
        style={[
          styles.messageBubble,
          message.type === 'user' ? styles.userBubble : styles.botBubble,
        ]}
      >
        {message.imageUrl && (
          <Image source={{ uri: message.imageUrl }} style={styles.messageImage} />
        )}
        
        <Text
          style={[
            styles.messageText,
            message.type === 'user' ? styles.userText : styles.botText,
          ]}
        >
          {message.message}
        </Text>
        
        {message.classification && renderClassificationCard(message.classification)}
        
        <Text style={styles.messageTime}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );

  const renderHistoryItem = (item: HistoryItem) => (
    <TouchableOpacity
      key={item._id}
      style={styles.historyItem}
      onPress={() => {
        const historyMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'bot',
          message: 'From your classification history:',
          imageUrl: item.imageUrl,
          classification: item.classification,
          timestamp: new Date(item.createdAt),
        };
        setMessages(prev => [...prev, historyMessage]);
        setShowHistory(false);
      }}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.historyImage} />
      <View style={styles.historyContent}>
        <Text style={styles.historyCategory}>{item.classification.category}</Text>
        <Text style={styles.historyReasoning} numberOfLines={2}>
          {item.classification.reasoning}
        </Text>
        <Text style={styles.historyDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={[
        styles.historyBadge,
        { backgroundColor: item.classification.isRecyclable ? '#10B981' : '#EF4444' }
      ]}>
        <Ionicons 
          name={item.classification.isRecyclable ? "checkmark" : "close"} 
          size={12} 
          color="#fff" 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.headerAvatar}
          >
            <Ionicons name="leaf" size={24} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>🌱 GreenMitra</Text>
            <Text style={styles.headerSubtitle}>AI Waste Classification Assistant</Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowHistory(!showHistory)}
          >
            <Ionicons name="time" size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={loadHistory}
          >
            <Ionicons name="refresh" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* History Panel */}
      {showHistory && (
        <View style={styles.historyPanel}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>📚 Classification History</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
          <ScrollView 
            style={styles.historyList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={loadHistory} />
            }
          >
            {history.length > 0 ? (
              history.map(renderHistoryItem)
            ) : (
              <View style={styles.emptyHistory}>
                <Ionicons name="leaf-outline" size={48} color={theme.textSecondary} />
                <Text style={styles.emptyHistoryText}>No classification history yet</Text>
                <Text style={styles.emptyHistorySubtext}>Send a message or image to start!</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => 
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>💡 Quick Ask:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsList}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => sendMessage("plastic bottle")}
            disabled={isLoading}
          >
            <Text style={styles.quickActionText}>🍼 Plastic Bottle</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => sendMessage("food waste")}
            disabled={isLoading}
          >
            <Text style={styles.quickActionText}>🍎 Food Waste</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => sendMessage("old newspaper")}
            disabled={isLoading}
          >
            <Text style={styles.quickActionText}>📰 Paper</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => sendMessage("battery")}
            disabled={isLoading}
          >
            <Text style={styles.quickActionText}>🔋 Battery</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={pickImage}
            disabled={isLoading}
          >
            <Ionicons name="camera" size={24} color={isLoading ? theme.textSecondary : theme.primary} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about any waste item..."
            placeholderTextColor={theme.textSecondary}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (inputText.trim() && !isLoading) && styles.sendButtonActive,
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={(inputText.trim() && !isLoading) ? "#fff" : theme.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingBottom: 80, 
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.background,
  },
  
  // History Panel
  historyPanel: {
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    maxHeight: height * 0.4,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    alignItems: 'center',
  },
  historyImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  historyReasoning: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  historyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHistory: {
    alignItems: 'center',
    padding: 40,
  },
  emptyHistoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    marginTop: 12,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 4,
  },
  
  // Chat
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 15,
    flexDirection: 'row',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    marginRight: 8,
    marginTop: 5,
  },
  avatarGradient: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: theme.primary,
    marginLeft: 50,
  },
  botBubble: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: theme.text,
  },
  messageTime: {
    fontSize: 11,
    color: theme.textSecondary,
    marginTop: 5,
    textAlign: 'right',
  },
  
  // Classification Card
  classificationCard: {
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  classificationHeader: {
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  classificationContent: {
    gap: 8,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  categoryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: theme.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  reasoningText: {
    fontSize: 13,
    color: theme.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  
  // Quick Actions
  quickActions: {
    backgroundColor: theme.card,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginHorizontal: 15,
    marginBottom: 8,
  },
  quickActionsList: {
    paddingHorizontal: 15,
  },
  quickAction: {
    backgroundColor: theme.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  quickActionText: {
    fontSize: 13,
    color: theme.text,
  },
  
  // Input
  inputContainer: {
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  imageButton: {
    padding: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: theme.background,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 15,
    color: theme.text,
    backgroundColor: theme.background,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.border,
  },
  sendButtonActive: {
    backgroundColor: theme.primary,
  },
});

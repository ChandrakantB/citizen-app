import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function ServicesScreen() {
  const handleServiceRequest = (serviceType: string) => {
    Alert.alert(
      `${serviceType} Request`,
      `You've requested ${serviceType} pickup service. This will be connected to backend soon!`,
      [
        { text: 'Schedule Pickup', onPress: () => Alert.alert('Success', 'Pickup scheduled! You will be notified.') },
        { text: 'Get Quote', onPress: () => Alert.alert('Quote', 'Quote request sent! We will contact you soon.') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const services = [
    { 
      name: 'Medical Waste', 
      icon: 'medical', 
      color: '#dc2626', 
      description: 'Safe disposal of syringes, medicines, bandages',
      price: 'Starting ₹200'
    },
    { 
      name: 'Construction Debris', 
      icon: 'construct', 
      color: '#f59e0b', 
      description: 'Concrete, bricks, tiles, construction materials',
      price: 'Starting ₹500'
    },
    { 
      name: 'Furniture Waste', 
      icon: 'bed', 
      color: '#8b5cf6', 
      description: 'Old furniture, mattresses, wooden items',
      price: 'Starting ₹300'
    },
    { 
      name: 'Electronic Waste', 
      icon: 'phone-portrait', 
      color: '#3b82f6', 
      description: 'Phones, computers, batteries, appliances',
      price: 'Starting ₹150'
    },
    { 
      name: 'Garden Waste', 
      icon: 'leaf', 
      color: '#22c55e', 
      description: 'Branches, leaves, grass, organic waste',
      price: 'Starting ₹100'
    },
    { 
      name: 'Hazardous Waste', 
      icon: 'warning', 
      color: '#ef4444', 
      description: 'Chemicals, paints, oils, dangerous materials',
      price: 'Quote based'
    },
    { 
      name: 'Bulk Waste', 
      icon: 'cube', 
      color: '#6b7280', 
      description: 'Large items, appliances, heavy materials',
      price: 'Starting ₹400'
    },
    { 
      name: 'Custom Waste', 
      icon: 'add-circle', 
      color: '#06b6d4', 
      description: 'Describe your specific waste requirements',
      price: 'Custom quote'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Waste Pickup Services</Text>
          <Text style={styles.subtitle}>Professional waste management solutions</Text>
        </View>

        <View style={styles.content}>
          {/* Services Grid */}
          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Available Services</Text>
            <Text style={styles.sectionSubtitle}>Choose the service that matches your waste type</Text>
            
            <View style={styles.servicesGrid}>
              {services.map((service, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.serviceCard, { borderLeftColor: service.color }]}
                  onPress={() => handleServiceRequest(service.name)}
                >
                  <View style={styles.serviceContent}>
                    <View style={styles.serviceHeader}>
                      <View style={[styles.serviceIconContainer, { backgroundColor: service.color + '20' }]}>
                        <Ionicons name={service.icon as any} size={28} color={service.color} />
                      </View>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Text style={styles.servicePrice}>{service.price}</Text>
                      </View>
                    </View>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                    <View style={styles.serviceFooter}>
                      <View style={styles.serviceFeatures}>
                        <Text style={styles.featureText}>✓ Same day pickup</Text>
                        <Text style={styles.featureText}>✓ Eco-friendly disposal</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={service.color} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Contact */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Need Help?</Text>
            <TouchableOpacity style={styles.contactCard}>
              <Ionicons name="call" size={24} color="#22c55e" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Call Us</Text>
                <Text style={styles.contactText}>+91 9876543210</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactCard}>
              <Ionicons name="chatbubble" size={24} color="#3b82f6" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Live Chat</Text>
                <Text style={styles.contactText}>Get instant support</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#059669',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a7f3d0',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 100,
  },
  servicesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  servicesGrid: {
    gap: 16,
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  serviceContent: {
    padding: 20,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  serviceFeatures: {
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 2,
  },
  contactSection: {
    marginTop: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactInfo: {
    marginLeft: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

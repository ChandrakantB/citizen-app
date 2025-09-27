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
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface Facility {
  id: string;
  title: string;
  description: string;
  type: 'Recycling Center' | 'Waste Collection Point' | 'Composting Facility' | 'E-Waste Center' | 'Medical Waste' | 'Hazardous Waste';
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  timings: string;
  services: string[];
  distance: string;
  icon: string;
  color: string;
}

export default function NearbyFacilitiesMap({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Jabalpur Ranjhi area coordinates and nearby waste management facilities
  const mapCenter = {
    latitude: 23.1815, // Ranjhi, Jabalpur coordinates
    longitude: 79.9864,
  };

  // Hardcoded waste management facilities in Jabalpur Ranjhi area
  const facilities: Facility[] = [
    {
      id: '1',
      title: 'Ranjhi Recycling Center',
      description: 'Complete recycling facility for plastic, paper, and metal waste',
      type: 'Recycling Center',
      latitude: 23.1820,
      longitude: 79.9870,
      address: 'Sector 2, Ranjhi, Jabalpur, MP 482005',
      phone: '+91 98765 43210',
      timings: '8:00 AM - 6:00 PM',
      services: ['Plastic Recycling', 'Paper Recycling', 'Metal Scrap', 'Glass Recycling'],
      distance: '0.8 km',
      icon: 'sync',
      color: '#22c55e'
    },
    {
      id: '2',
      title: 'Sector 3 Waste Collection Point',
      description: 'Municipal waste collection point with segregation facility',
      type: 'Waste Collection Point',
      latitude: 23.1810,
      longitude: 79.9850,
      address: 'Near Sector 3 Market, Ranjhi, Jabalpur, MP 482005',
      phone: '+91 98765 43211',
      timings: '6:00 AM - 10:00 PM',
      services: ['Wet Waste Collection', 'Dry Waste Collection', 'Bulk Waste Pickup'],
      distance: '1.2 km',
      icon: 'trash',
      color: '#3b82f6'
    },
    {
      id: '3',
      title: 'Ranjhi Composting Unit',
      description: 'Organic waste composting facility and vermicomposting center',
      type: 'Composting Facility',
      latitude: 23.1825,
      longitude: 79.9880,
      address: 'Behind Ranjhi Police Station, Jabalpur, MP 482005',
      phone: '+91 98765 43212',
      timings: '7:00 AM - 5:00 PM',
      services: ['Organic Waste Processing', 'Compost Sales', 'Vermicomposting'],
      distance: '1.5 km',
      icon: 'leaf',
      color: '#84cc16'
    },
    {
      id: '4',
      title: 'E-Waste Collection Center',
      description: 'Specialized center for electronic waste disposal and refurbishment',
      type: 'E-Waste Center',
      latitude: 23.1800,
      longitude: 79.9840,
      address: 'Sector 1, Near Bus Stand, Ranjhi, Jabalpur, MP 482005',
      phone: '+91 98765 43213',
      timings: '9:00 AM - 7:00 PM',
      services: ['Mobile Phone Recycling', 'Computer Disposal', 'Battery Collection', 'TV/Appliance Disposal'],
      distance: '2.1 km',
      icon: 'phone-portrait',
      color: '#f59e0b'
    },
    {
      id: '5',
      title: 'Ranjhi Medical Waste Center',
      description: 'Authorized medical and biomedical waste disposal facility',
      type: 'Medical Waste',
      latitude: 23.1835,
      longitude: 79.9890,
      address: 'Industrial Area, Ranjhi, Jabalpur, MP 482005',
      phone: '+91 98765 43214',
      timings: '8:00 AM - 4:00 PM (Mon-Fri)',
      services: ['Syringe Disposal', 'Medicine Disposal', 'Biomedical Waste', 'Laboratory Waste'],
      distance: '2.8 km',
      icon: 'medical',
      color: '#ef4444'
    },
    {
      id: '6',
      title: 'Hazardous Waste Collection Point',
      description: 'Safe disposal of hazardous materials and chemicals',
      type: 'Hazardous Waste',
      latitude: 23.1790,
      longitude: 79.9860,
      address: 'Ranjhi Industrial Zone, Jabalpur, MP 482005',
      phone: '+91 98765 43215',
      timings: '9:00 AM - 5:00 PM (Mon-Sat)',
      services: ['Chemical Disposal', 'Paint Disposal', 'Pesticide Collection', 'Industrial Waste'],
      distance: '3.2 km',
      icon: 'warning',
      color: '#dc2626'
    }
  ];

  const facilityTypes = [
    { key: 'all', label: 'All', count: facilities.length },
    { key: 'Recycling Center', label: 'Recycle', count: facilities.filter(f => f.type === 'Recycling Center').length },
    { key: 'Waste Collection Point', label: 'Collection', count: facilities.filter(f => f.type === 'Waste Collection Point').length },
    { key: 'Composting Facility', label: 'Compost', count: facilities.filter(f => f.type === 'Composting Facility').length },
    { key: 'E-Waste Center', label: 'E-Waste', count: facilities.filter(f => f.type === 'E-Waste Center').length },
  ];

  const filteredFacilities = activeFilter === 'all' 
    ? facilities 
    : facilities.filter(facility => facility.type === activeFilter);

  const handleFacilityPress = (facility: Facility) => {
    setSelectedFacility(facility);
  };

  const handleGetDirections = (facility: Facility) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${facility.latitude},${facility.longitude}`,
      android: `geo:0,0?q=${facility.latitude},${facility.longitude}`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`
    });
    
    if (url) {
      Linking.openURL(url).catch(() => {
        if (Platform.OS === 'web') {
          alert(`Opening directions to ${facility.title}\nAddress: ${facility.address}`);
        } else {
          Alert.alert('Error', 'Could not open directions. Please install a maps app.');
        }
      });
    }
  };

  const handleCall = (phone: string) => {
    const url = `tel:${phone}`;
    Linking.openURL(url).catch(() => {
      if (Platform.OS === 'web') {
        alert(`Call ${phone}`);
      }
    });
  };

  const renderFilterTabs = () => (
    <View style={styles.filterSection}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabs}
        contentContainerStyle={styles.filterTabsContent}
      >
        {facilityTypes.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              activeFilter === filter.key && styles.activeFilterTab
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text style={[
              styles.filterTabText,
              activeFilter === filter.key && styles.activeFilterTabText
            ]}>
              {filter.label}
            </Text>
            <View style={[
              styles.filterTabBadge,
              activeFilter === filter.key && styles.activeFilterTabBadge
            ]}>
              <Text style={[
                styles.filterTabBadgeText,
                activeFilter === filter.key && styles.activeFilterTabBadgeTextActive
              ]}>
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      {/* Map Header */}
      <View style={styles.mapHeader}>
        <View style={styles.mapLocationInfo}>
          <Ionicons name="location" size={16} color={theme.primary} />
          <Text style={styles.mapLocationText}>Ranjhi, Jabalpur</Text>
        </View>
        <TouchableOpacity
          style={styles.openInMapsButton}
          onPress={() => handleGetDirections({ ...mapCenter, title: 'Ranjhi Area', address: 'Ranjhi, Jabalpur, MP' } as any)}
        >
          <Ionicons name="open-outline" size={14} color={theme.primary} />
          <Text style={styles.openInMapsText}>Open Maps</Text>
        </TouchableOpacity>
      </View>

      {/* Enhanced Visual Map */}
      <View style={styles.visualMap}>
        <View style={styles.mapBackground}>
          {/* Street lines for realistic look */}
          <View style={styles.streetHorizontal1} />
          <View style={styles.streetHorizontal2} />
          <View style={styles.streetVertical1} />
          <View style={styles.streetVertical2} />
          
          {/* Building blocks */}
          <View style={styles.buildingBlock1} />
          <View style={styles.buildingBlock2} />
          <View style={styles.buildingBlock3} />
          <View style={styles.buildingBlock4} />
        </View>

        {/* Facility markers positioned based on relative coordinates */}
        {filteredFacilities.map((facility, index) => {
          // Better positioning algorithm
          const positions = [
            { top: '25%', left: '20%' },
            { top: '35%', left: '65%' },
            { top: '60%', left: '30%' },
            { top: '70%', left: '75%' },
            { top: '45%', left: '15%' },
            { top: '80%', left: '55%' }
          ];
          
          const position = positions[index] || { top: '50%', left: '50%' };
          
          return (
            <TouchableOpacity
              key={facility.id}
              style={[
                styles.mapMarker,
                {
                  top: position.top,
                  left: position.left,
                  backgroundColor: facility.color,
                }
              ]}
              onPress={() => handleFacilityPress(facility)}
            >
              <Ionicons name={facility.icon as any} size={14} color="#ffffff" />
              <View style={styles.markerPulse} />
            </TouchableOpacity>
          );
        })}

        {/* Center marker for user location */}
        <View style={styles.userLocationMarker}>
          <View style={styles.userLocationDot}>
            <Ionicons name="person" size={10} color="#ffffff" />
          </View>
          <View style={styles.userLocationPulse} />
        </View>
      </View>
    </View>
  );

  const renderFacilitiesList = () => (
    <ScrollView style={styles.facilitiesList} showsVerticalScrollIndicator={false}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {filteredFacilities.length} Facilities Found
        </Text>
      </View>
      
      {filteredFacilities.map((facility) => (
        <TouchableOpacity
          key={facility.id}
          style={styles.facilityCard}
          onPress={() => handleFacilityPress(facility)}
          activeOpacity={0.7}
        >
          <View style={styles.facilityCardHeader}>
            <View style={[styles.facilityIcon, { backgroundColor: facility.color + '15' }]}>
              <Ionicons name={facility.icon as any} size={18} color={facility.color} />
            </View>
            <View style={styles.facilityInfo}>
              <Text style={styles.facilityTitle}>{facility.title}</Text>
              <Text style={styles.facilityType}>{facility.type}</Text>
              <View style={styles.facilityMeta}>
                <Text style={styles.facilityDistance}>📍 {facility.distance}</Text>
                <Text style={styles.facilityTimings}>🕒 {facility.timings.split(' ')[0]}</Text>
              </View>
            </View>
            <View style={[styles.facilityTypeBadge, { backgroundColor: facility.color + '15' }]}>
              <Text style={[styles.facilityTypeText, { color: facility.color }]}>
                {facility.type.split(' ')[0]}
              </Text>
            </View>
          </View>
          
          <Text style={styles.facilityDescription} numberOfLines={2}>{facility.description}</Text>
          
          <View style={styles.facilityActions}>
            <TouchableOpacity
              style={styles.facilityActionButton}
              onPress={() => handleGetDirections(facility)}
            >
              <Ionicons name="navigate" size={14} color={theme.primary} />
              <Text style={styles.facilityActionText}>Directions</Text>
            </TouchableOpacity>
            
            {facility.phone && (
              <TouchableOpacity
                style={styles.facilityActionButton}
                onPress={() => handleCall(facility.phone!)}
              >
                <Ionicons name="call" size={14} color={theme.primary} />
                <Text style={styles.facilityActionText}>Call</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.facilityActionButton}
              onPress={() => setSelectedFacility(facility)}
            >
              <Ionicons name="information-circle" size={14} color={theme.primary} />
              <Text style={styles.facilityActionText}>Details</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderFacilityDetails = () => (
    <Modal
      visible={!!selectedFacility}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.facilityDetailContainer, { backgroundColor: theme.background }]}>
        <View style={styles.facilityDetailHeader}>
          <TouchableOpacity 
            style={styles.closeDetailButton}
            onPress={() => setSelectedFacility(null)}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.facilityDetailTitle}>Facility Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.facilityDetailContent}>
          {selectedFacility && (
            <>
              <View style={styles.facilityDetailCard}>
                <View style={styles.facilityDetailHeaderInfo}>
                  <View style={[styles.facilityDetailIcon, { backgroundColor: selectedFacility.color + '20' }]}>
                    <Ionicons name={selectedFacility.icon as any} size={32} color={selectedFacility.color} />
                  </View>
                  <View style={styles.facilityDetailInfo}>
                    <Text style={styles.facilityDetailName}>{selectedFacility.title}</Text>
                    <Text style={styles.facilityDetailType}>{selectedFacility.type}</Text>
                    <Text style={styles.facilityDetailDistance}>📍 {selectedFacility.distance}</Text>
                  </View>
                </View>

                <Text style={styles.facilityDetailDescription}>{selectedFacility.description}</Text>

                <View style={styles.facilityDetailSection}>
                  <Text style={styles.facilityDetailSectionTitle}>📍 Address</Text>
                  <Text style={styles.facilityDetailSectionText}>{selectedFacility.address}</Text>
                </View>

                <View style={styles.facilityDetailSection}>
                  <Text style={styles.facilityDetailSectionTitle}>⏰ Timings</Text>
                  <Text style={styles.facilityDetailSectionText}>{selectedFacility.timings}</Text>
                </View>

                {selectedFacility.phone && (
                  <View style={styles.facilityDetailSection}>
                    <Text style={styles.facilityDetailSectionTitle}>📞 Contact</Text>
                    <TouchableOpacity onPress={() => handleCall(selectedFacility.phone!)}>
                      <Text style={[styles.facilityDetailSectionText, { color: theme.primary }]}>
                        {selectedFacility.phone}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.facilityDetailSection}>
                  <Text style={styles.facilityDetailSectionTitle}>🛠️ Services Offered</Text>
                  <View style={styles.servicesContainer}>
                    {selectedFacility.services.map((service, index) => (
                      <View key={index} style={styles.serviceTag}>
                        <Text style={styles.serviceTagText}>{service}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.facilityDetailActions}>
                  <TouchableOpacity 
                    style={[styles.detailActionButton, { backgroundColor: theme.primary }]}
                    onPress={() => handleGetDirections(selectedFacility)}
                  >
                    <Ionicons name="navigate" size={20} color="#ffffff" />
                    <Text style={styles.detailActionButtonText}>Get Directions</Text>
                  </TouchableOpacity>
                  
                  {selectedFacility.phone && (
                    <TouchableOpacity 
                      style={[styles.detailActionButton, { backgroundColor: theme.success }]}
                      onPress={() => handleCall(selectedFacility.phone!)}
                    >
                      <Ionicons name="call" size={20} color="#ffffff" />
                      <Text style={styles.detailActionButtonText}>Call Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
          <Text style={styles.headerTitle}>Nearby Facilities</Text>
          <TouchableOpacity style={styles.locationButton}>
            <Ionicons name="location" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {renderFilterTabs()}
        {renderMapView()}
        {renderFacilitiesList()}
        {renderFacilityDetails()}
      </SafeAreaView>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

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
  locationButton: {
    padding: 4,
  },
  
  // Improved Filter Section
  filterSection: {
    paddingVertical: 12,
  },
  filterTabs: {
    paddingHorizontal: 20,
  },
  filterTabsContent: {
    paddingRight: 20,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
  },
  activeFilterTab: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  activeFilterTabText: {
    color: '#ffffff',
  },
  filterTabBadge: {
    backgroundColor: theme.border,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 16,
    alignItems: 'center',
  },
  activeFilterTabBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterTabBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  filterTabBadgeTextActive: {
    color: '#ffffff',
  },
  
  // Enhanced Map Container
  mapContainer: {
    height: 160,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: theme.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  mapLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  mapLocationText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.text,
  },
  openInMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: theme.primary + '10',
  },
  openInMapsText: {
    fontSize: 10,
    color: theme.primary,
    fontWeight: '500',
  },
  
  // Realistic Map Design
  visualMap: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f0f4f8',
  },
  mapBackground: {
    flex: 1,
    position: 'relative',
  },
  streetHorizontal1: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#cbd5e0',
  },
  streetHorizontal2: {
    position: 'absolute',
    top: '70%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#cbd5e0',
  },
  streetVertical1: {
    position: 'absolute',
    left: '25%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#cbd5e0',
  },
  streetVertical2: {
    position: 'absolute',
    left: '75%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#cbd5e0',
  },
  buildingBlock1: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '12%',
    height: '15%',
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  buildingBlock2: {
    position: 'absolute',
    top: '35%',
    left: '60%',
    width: '12%',
    height: '15%',
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  buildingBlock3: {
    position: 'absolute',
    top: '75%',
    left: '15%',
    width: '12%',
    height: '15%',
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  buildingBlock4: {
    position: 'absolute',
    top: '45%',
    left: '85%',
    width: '12%',
    height: '15%',
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  mapMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    zIndex: -1,
  },
  userLocationMarker: {
    position: 'absolute',
    top: '45%',
    left: '45%',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.primary,
  },
  userLocationDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationPulse: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.primary + '20',
    zIndex: -1,
  },
  
  // Improved Facilities List
  facilitiesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listHeader: {
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  facilityCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.border + '50',
  },
  facilityCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  facilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  facilityType: {
    fontSize: 11,
    color: theme.primary,
    fontWeight: '500',
    marginBottom: 3,
  },
  facilityMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  facilityDistance: {
    fontSize: 10,
    color: theme.textSecondary,
  },
  facilityTimings: {
    fontSize: 10,
    color: theme.textSecondary,
  },
  facilityTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  facilityTypeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  facilityDescription: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  facilityActions: {
    flexDirection: 'row',
    gap: 8,
  },
  facilityActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 3,
    flex: 1,
    justifyContent: 'center',
  },
  facilityActionText: {
    fontSize: 10,
    color: theme.primary,
    fontWeight: '500',
  },
  
  // Keep existing detail modal styles unchanged
  facilityDetailContainer: {
    flex: 1,
  },
  facilityDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  closeDetailButton: {
    padding: 4,
  },
  facilityDetailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  facilityDetailContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  facilityDetailCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  facilityDetailHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  facilityDetailIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  facilityDetailInfo: {
    flex: 1,
  },
  facilityDetailName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  facilityDetailType: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  facilityDetailDistance: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  facilityDetailDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  facilityDetailSection: {
    marginBottom: 16,
  },
  facilityDetailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  facilityDetailSectionText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    backgroundColor: theme.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.primary,
  },
  facilityDetailActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  detailActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  detailActionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

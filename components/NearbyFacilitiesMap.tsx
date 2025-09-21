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
    { key: 'all', label: 'All Facilities', count: facilities.length },
    { key: 'Recycling Center', label: 'Recycling', count: facilities.filter(f => f.type === 'Recycling Center').length },
    { key: 'Waste Collection Point', label: 'Collection', count: facilities.filter(f => f.type === 'Waste Collection Point').length },
    { key: 'Composting Facility', label: 'Composting', count: facilities.filter(f => f.type === 'Composting Facility').length },
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
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterTabs}
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
            {filter.label} ({filter.count})
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      {/* Map Header */}
      <View style={styles.mapHeader}>
        <View style={styles.mapLocationInfo}>
          <Ionicons name="location" size={20} color={theme.primary} />
          <Text style={styles.mapLocationText}>Ranjhi, Jabalpur - Waste Management Facilities</Text>
        </View>
        <TouchableOpacity
          style={styles.openInMapsButton}
          onPress={() => handleGetDirections({ ...mapCenter, title: 'Ranjhi Area', address: 'Ranjhi, Jabalpur, MP' } as any)}
        >
          <Ionicons name="open-outline" size={16} color={theme.primary} />
          <Text style={styles.openInMapsText}>Open in Maps</Text>
        </TouchableOpacity>
      </View>

      {/* Visual Map Representation */}
      <View style={styles.visualMap}>
        <View style={styles.mapGrid}>
          {/* Create a visual grid representing the map area */}
          {Array.from({ length: 15 }).map((_, index) => (
            <View key={index} style={styles.mapGridItem} />
          ))}
        </View>

        {/* Facility markers positioned based on relative coordinates */}
        {filteredFacilities.map((facility, index) => {
          // Calculate relative position (simplified for demo)
          const relativeTop = 20 + (index * 40) + Math.sin(index) * 30;
          const relativeLeft = 30 + (index * 50) + Math.cos(index) * 40;
          
          return (
            <TouchableOpacity
              key={facility.id}
              style={[
                styles.mapMarker,
                {
                  top: `${Math.max(10, Math.min(80, relativeTop))}%`,
                  left: `${Math.max(10, Math.min(80, relativeLeft))}%`,
                  backgroundColor: facility.color,
                }
              ]}
              onPress={() => handleFacilityPress(facility)}
            >
              <Ionicons name={facility.icon as any} size={16} color="#ffffff" />
            </TouchableOpacity>
          );
        })}

        {/* Center marker for user location */}
        <View style={styles.userLocationMarker}>
          <View style={styles.userLocationDot}>
            <Ionicons name="person" size={12} color="#ffffff" />
          </View>
        </View>
      </View>

      {/* Map Legend */}
      <View style={styles.mapLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: theme.primary }]}>
            <Ionicons name="person" size={10} color="#ffffff" />
          </View>
          <Text style={styles.legendText}>Your Location</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: '#22c55e' }]} />
          <Text style={styles.legendText}>Waste Facilities</Text>
        </View>
      </View>
    </View>
  );

  const renderFacilitiesList = () => (
    <ScrollView style={styles.facilitiesList}>
      <Text style={styles.listTitle}>
        {filteredFacilities.length} Facilities Found
      </Text>
      
      {filteredFacilities.map((facility) => (
        <TouchableOpacity
          key={facility.id}
          style={styles.facilityCard}
          onPress={() => handleFacilityPress(facility)}
        >
          <View style={styles.facilityCardHeader}>
            <View style={[styles.facilityIcon, { backgroundColor: facility.color + '20' }]}>
              <Ionicons name={facility.icon as any} size={20} color={facility.color} />
            </View>
            <View style={styles.facilityInfo}>
              <Text style={styles.facilityTitle}>{facility.title}</Text>
              <Text style={styles.facilityType}>{facility.type}</Text>
              <Text style={styles.facilityDistance}>📍 {facility.distance} away</Text>
            </View>
            <View style={[styles.facilityTypeBadge, { backgroundColor: facility.color + '20' }]}>
              <Text style={[styles.facilityTypeText, { color: facility.color }]}>
                {facility.type.split(' ')[0]}
              </Text>
            </View>
          </View>
          
          <Text style={styles.facilityDescription}>{facility.description}</Text>
          
          <View style={styles.facilityActions}>
            <TouchableOpacity
              style={styles.facilityActionButton}
              onPress={() => handleGetDirections(facility)}
            >
              <Ionicons name="navigate" size={16} color={theme.primary} />
              <Text style={styles.facilityActionText}>Directions</Text>
            </TouchableOpacity>
            
            {facility.phone && (
              <TouchableOpacity
                style={styles.facilityActionButton}
                onPress={() => handleCall(facility.phone!)}
              >
                <Ionicons name="call" size={16} color={theme.primary} />
                <Text style={styles.facilityActionText}>Call</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.facilityActionButton}
              onPress={() => setSelectedFacility(facility)}
            >
              <Ionicons name="information-circle" size={16} color={theme.primary} />
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
  filterTabs: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterTab: {
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activeFilterTab: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  activeFilterTabText: {
    color: '#ffffff',
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: theme.surface,
    overflow: 'hidden',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  mapLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  mapLocationText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.text,
  },
  openInMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openInMapsText: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '500',
  },
  visualMap: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f8fafc',
  },
  mapGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mapGridItem: {
    width: '20%',
    height: '20%',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f1f5f9',
  },
  mapMarker: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
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
  userLocationMarker: {
    position: 'absolute',
    top: '45%',
    left: '45%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.primary,
  },
  userLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 10,
    color: theme.textSecondary,
  },
  facilitiesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  facilityCard: {
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
  facilityCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  facilityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  facilityType: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  facilityDistance: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  facilityTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  facilityTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  facilityDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  facilityActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  facilityActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  facilityActionText: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '500',
  },
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

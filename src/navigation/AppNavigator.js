import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Gradients } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';

import LoginScreen          from '../screens/LoginScreen';
import DashboardScreen      from '../screens/DashboardScreen';
import CustomersScreen      from '../screens/CustomersScreen';
import CustomerDetailScreen from '../screens/CustomerDetailScreen';
import AddCustomerScreen    from '../screens/AddCustomerScreen';
import SearchScreen         from '../screens/SearchScreen';
import ReportsScreen        from '../screens/ReportsScreen';
import BillScreen           from '../screens/BillScreen';
import ExportScreen         from '../screens/ExportScreen';
import BusinessScreen       from '../screens/BusinessScreen';
import ProfileScreen        from '../screens/ProfileScreen';
import StaffScreen          from '../screens/StaffScreen';
import ImportScreen         from '../screens/ImportScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOpts = {
  headerStyle:         { backgroundColor: Colors.bgMid },
  headerTintColor:     Colors.white,
  headerTitleStyle:    { fontWeight: '800', fontSize: 16, letterSpacing: -0.2 },
  headerShadowVisible: false,
  contentStyle:        { backgroundColor: Colors.bg },
};

function TabIcon({ symbol, focused }) {
  if (focused) {
    return (
      <LinearGradient
        colors={Gradients.tabGlow}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ width: 44, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(6,182,212,0.30)' }}
      >
        <Text style={{ fontSize: 25, lineHeight: 27, fontWeight: '700', color: Colors.cyanSoft }}>{symbol}</Text>
      </LinearGradient>
    );
  }
  return (
    <View style={{ width: 44, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 25, lineHeight: 27, fontWeight: '600', color: Colors.faint }}>{symbol}</Text>
    </View>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="DashboardHome"  component={DashboardScreen}      options={{ headerShown: false }} />
      <Stack.Screen name="AddCustomer"    component={AddCustomerScreen}    options={({ route }) => ({ title: route.params?.customer ? 'Edit Customer' : 'Add Customer', headerBackTitle: 'Back' })} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Customer Detail', headerBackTitle: 'Back' }} />
    </Stack.Navigator>
  );
}

function CustomersStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="CustomersList"  component={CustomersScreen}      options={{ headerShown: false }} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Customer Detail', headerBackTitle: 'Back' }} />
      <Stack.Screen name="AddCustomer"    component={AddCustomerScreen}    options={({ route }) => ({ title: route.params?.customer ? 'Edit Customer' : 'Add Customer', headerBackTitle: 'Back' })} />
    </Stack.Navigator>
  );
}

function BusinessStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="BusinessHome" component={BusinessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile"      component={ProfileScreen}  options={{ title: 'Edit Profile',     headerBackTitle: 'Back' }} />
      <Stack.Screen name="Reports"      component={ReportsScreen}  options={{ title: 'Reports',          headerBackTitle: 'Back' }} />
      <Stack.Screen name="Export"       component={ExportScreen}   options={{ title: 'Export Data',      headerBackTitle: 'Back' }} />
      <Stack.Screen name="Staff"        component={StaffScreen}    options={{ title: 'Manage Staff',     headerBackTitle: 'Back' }} />
      <Stack.Screen name="Import"       component={ImportScreen}   options={{ title: 'Import from BSNL', headerBackTitle: 'Back' }} />
    </Stack.Navigator>
  );
}

const tabBarTheme = (insets) => ({
  headerShown: false,
  tabBarStyle: {
    backgroundColor:    Colors.tabBar,
    borderTopColor:     Colors.border,
    borderTopWidth:     1,
    height:             76 + insets.bottom,
    paddingBottom:      insets.bottom || 10,
    paddingTop:         10,
  },
  tabBarActiveTintColor:   Colors.cyanSoft,
  tabBarInactiveTintColor: Colors.faint,
  tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 3, letterSpacing: 0.2 },
});

const TAB_ICONS = {
  Dashboard: '⌂',
  Customers: '◉',
  Bills:     '₹',
  Search:    '⌕',
  Business:  '▦',
};

function tabOptions(name) {
  return {
    tabBarIcon: ({ focused }) => <TabIcon symbol={TAB_ICONS[name]} focused={focused} />,
    tabBarLabel: name,
  };
}

function OwnerTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={tabBarTheme(insets)}>
      <Tab.Screen name="Dashboard" component={DashboardStack} options={tabOptions('Dashboard')} />
      <Tab.Screen name="Customers" component={CustomersStack} options={tabOptions('Customers')} />
      <Tab.Screen name="Bills"     component={BillScreen}     options={tabOptions('Bills')}     />
      <Tab.Screen name="Search"    component={SearchScreen}   options={tabOptions('Search')}    />
      <Tab.Screen name="Business"  component={BusinessStack}  options={tabOptions('Business')}  />
    </Tab.Navigator>
  );
}

function StaffTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={tabBarTheme(insets)}>
      <Tab.Screen name="Dashboard" component={DashboardStack} options={tabOptions('Dashboard')} />
      <Tab.Screen name="Customers" component={CustomersStack} options={tabOptions('Customers')} />
      <Tab.Screen name="Bills"     component={BillScreen}     options={tabOptions('Bills')}     />
      <Tab.Screen name="Search"    component={SearchScreen}   options={tabOptions('Search')}    />
    </Tab.Navigator>
  );
}

function MainNav() {
  const { role, loading } = useRole();
  if (loading) return null;
  return role === 'owner' ? <OwnerTabs /> : <StaffTabs />;
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main"  component={MainNav}     />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

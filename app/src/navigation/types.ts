import {NavigatorScreenParams} from '@react-navigation/native';

// Auth stack ---------------------------------------------------------------

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
};

// Citizen Home stack -------------------------------------------------------

export type HomeStackParamList = {
  Home: undefined;
  MyReports: undefined;
  ReportDetail: {reportId: string};
  CreateReport: undefined;
};

// Staff stack --------------------------------------------------------------

export type StaffStackParamList = {
  StaffReportsList: undefined;
  StaffReportDetail: {reportId: string};
};

// App tab navigator --------------------------------------------------------

export type AppTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  Notifications: undefined;
  Profile: undefined;
  Logout: undefined;
  StaffTab: NavigatorScreenParams<StaffStackParamList>;
};

// Root navigator -----------------------------------------------------------

export type RootParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppTabParamList>;
};

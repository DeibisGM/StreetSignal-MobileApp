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
  ReportDetail: {reportId: string};
};

// Staff stack --------------------------------------------------------------

export type StaffStackParamList = {
  StaffReportsList: undefined;
  StaffReportDetail: {reportId: string};
};

// App tab navigator --------------------------------------------------------

export type AppTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  CreateReport: undefined;
  StaffTab: NavigatorScreenParams<StaffStackParamList>;
  Notifications: undefined;
  Profile: undefined;
};

// Root navigator -----------------------------------------------------------

export type RootParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppTabParamList>;
};

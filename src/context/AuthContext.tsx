import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { getUserProfile, saveUserProfile, seedDemoDataIfEmpty } from '../lib/db.ts';
import { UserProfile, UserRole } from '../types.ts';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginAsDemoUser: (role: UserRole) => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize demo data in background
  useEffect(() => {
    seedDemoDataIfEmpty().catch(console.error);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            // Check if user email is director/admin
            const isDirector = firebaseUser.email === 'yonatanwondwsn75@gmail.com';
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Camp Parent',
              phone: '',
              role: isDirector ? 'director' : 'parent',
              avatarUrl: firebaseUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
            };
            await saveUserProfile(newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        // If not authenticated via Firebase, check if there's a stored demo profile
        const savedDemo = localStorage.getItem('driftwood_demo_user');
        if (savedDemo) {
          try {
            setUserProfile(JSON.parse(savedDemo));
          } catch {
            setUserProfile(null);
          }
        } else {
          // Default to demo parent profile so everything is immediately visible and testable
          const defaultDemo: UserProfile = {
            uid: 'parent-demo-1',
            email: 'solomon.k@gmail.com',
            name: 'Solomon Kebede',
            phone: '+251 91 123 4567',
            role: 'parent',
            createdAt: new Date().toISOString(),
          };
          setUserProfile(defaultDemo);
          localStorage.setItem('driftwood_demo_user', JSON.stringify(defaultDemo));
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      localStorage.removeItem('driftwood_demo_user');
      const isDirector = res.user.email === 'yonatanwondwsn75@gmail.com';
      const existing = await getUserProfile(res.user.uid);
      if (existing) {
        setUserProfile(existing);
      } else {
        const newProf: UserProfile = {
          uid: res.user.uid,
          email: res.user.email || '',
          name: res.user.displayName || 'Camp Parent',
          phone: '',
          role: isDirector ? 'director' : 'parent',
          avatarUrl: res.user.photoURL || undefined,
          createdAt: new Date().toISOString(),
        };
        await saveUserProfile(newProf);
        setUserProfile(newProf);
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    }
  };

  const loginAsDemoUser = async (role: UserRole) => {
    const demoProfile: UserProfile = role === 'director'
      ? {
          uid: 'director-demo-1',
          email: 'director@driftwoodcamp.com',
          name: 'Director Haile',
          phone: '+251 91 999 8888',
          role: 'director',
          createdAt: '2026-11-01T08:00:00.000Z',
        }
      : {
          uid: 'parent-demo-1',
          email: 'solomon.k@gmail.com',
          name: 'Solomon Kebede',
          phone: '+251 91 123 4567',
          role: 'parent',
          createdAt: '2026-11-01T08:30:00.000Z',
        };

    setUserProfile(demoProfile);
    localStorage.setItem('driftwood_demo_user', JSON.stringify(demoProfile));
  };

  const switchRole = async (newRole: UserRole) => {
    if (userProfile) {
      const updated = { ...userProfile, role: newRole };
      setUserProfile(updated);
      if (currentUser) {
        await saveUserProfile(updated);
      } else {
        localStorage.setItem('driftwood_demo_user', JSON.stringify(updated));
      }
    } else {
      await loginAsDemoUser(newRole);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);
    if (currentUser) {
      await saveUserProfile(updated);
    } else {
      localStorage.setItem('driftwood_demo_user', JSON.stringify(updated));
    }
  };

  const logout = async () => {
    if (currentUser) {
      await signOut(auth);
    }
    localStorage.removeItem('driftwood_demo_user');
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        loginAsDemoUser,
        switchRole,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

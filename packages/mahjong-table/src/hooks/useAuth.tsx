import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User, Session } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("getSession timeout")), 5000)
        );
        
        let sessionData: { data: { session: Session | null }, error: any } | null = null;
        try {
          sessionData = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: Session | null }, error: any };
        } catch (sessionError) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        if (!sessionData) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        const { data: { session }, error } = sessionData;
        
        if (error) {
          setUser(null);
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    (async () => {
      try {
        await checkSession();
      } catch (error) {
        setLoading(false);
      }
    })();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
   
  return { user, setUser, loading };
};
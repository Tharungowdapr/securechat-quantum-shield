
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Contact {
  id: string;
  contact_name: string;
  contact_user_id: string;
  status?: string;
}

interface ContactsListProps {
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}

export const ContactsList: React.FC<ContactsListProps> = ({ 
  selectedContact, 
  onSelectContact 
}) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;

    try {
      // Load existing contacts
      const { data: existingContacts, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // If no contacts exist, create demo contacts
      if (!existingContacts || existingContacts.length === 0) {
        await createDemoContacts();
        return;
      }

      setContacts(existingContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      // Create demo contacts as fallback
      await createDemoContacts();
    } finally {
      setLoading(false);
    }
  };

  const createDemoContacts = async () => {
    if (!user) return;

    try {
      // Create demo contacts for testing
      const demoContacts = [
        {
          user_id: user.id,
          contact_name: 'Alice Demo',
          contact_user_id: 'demo-alice',
          status: 'online'
        },
        {
          user_id: user.id,
          contact_name: 'Bob Demo',
          contact_user_id: 'demo-bob',
          status: 'online'
        },
        {
          user_id: user.id,
          contact_name: 'Security Team',
          contact_user_id: 'demo-security',
          status: 'online'
        }
      ];

      const { data, error } = await supabase
        .from('contacts')
        .insert(demoContacts)
        .select();

      if (error) throw error;

      setContacts(data || []);
    } catch (error) {
      console.error('Error creating demo contacts:', error);
      // Set fallback contacts for UI testing
      const fallbackContacts = [
        {
          id: 'fallback-1',
          contact_name: 'Demo User 1',
          contact_user_id: 'demo-user-1',
          status: 'online'
        },
        {
          id: 'fallback-2',
          contact_name: 'Demo User 2', 
          contact_user_id: 'demo-user-2',
          status: 'online'
        }
      ];
      setContacts(fallbackContacts);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 p-4 border-b">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-3 text-gray-500"></i>
          <input 
            type="text" 
            placeholder="Search contacts" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 rounded-lg bg-white border-none focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <i className="fas fa-users text-4xl mb-2"></i>
            <p>No contacts found</p>
            <p className="text-sm">Demo contacts will be created automatically</p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedContact?.id === contact.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
              }`}
            >
              <div className="flex items-center">
                <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  {contact.contact_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{contact.contact_name}</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    {contact.status || 'Online'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

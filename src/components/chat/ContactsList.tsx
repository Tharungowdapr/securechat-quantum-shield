
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ContactsListProps {
  selectedContact: any;
  onSelectContact: (contact: any) => void;
}

export const ContactsList: React.FC<ContactsListProps> = ({
  selectedContact,
  onSelectContact
}) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('last_message_time', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const searchUsers = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('search_users', { search_term: term });

      if (error) throw error;
      
      // Filter out current user
      const filtered = (data || []).filter((u: any) => u.id !== user?.id);
      setSearchResults(filtered);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const addContact = async (userToAdd: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_user_id: userToAdd.id,
          contact_name: userToAdd.full_name || userToAdd.email
        });

      if (error) throw error;
      
      setSearchTerm('');
      setSearchResults([]);
      loadContacts();
    } catch (error) {
      console.error('Failed to add contact:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <Input
          placeholder="Search contacts or add new..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {searchResults.length > 0 && (
        <div className="border-b bg-gray-50">
          <div className="p-2 text-sm font-semibold text-gray-600">Add Contact</div>
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="p-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{user.full_name || user.email}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
              <Button
                size="sm"
                onClick={() => addContact(user)}
              >
                Add
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No contacts yet. Search above to add contacts.
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedContact?.id === contact.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => onSelectContact(contact)}
            >
              <div className="flex items-center">
                <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  {contact.contact_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{contact.contact_name}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {contact.last_message || 'No messages yet'}
                  </div>
                </div>
                {contact.unread_count > 0 && (
                  <div className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {contact.unread_count}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

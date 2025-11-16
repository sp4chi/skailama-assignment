import { useState } from 'react';
import './App.css';
import ProfileManager from './components/ProfileManager';
import EventManager from './components/EventManager';

const API_URL = import.meta.env.VITE_API_URL || '';

function App() {
  const [activeTab, setActiveTab] = useState('profiles');
  const [selectedProfile, setSelectedProfile] = useState(null);

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
  };

  return (
    <div className='App'>
      <header className='app-header'>
        <h1>📅 Event Management System</h1>
        <p className='subtitle'>Multi-Timezone Event Management</p>
      </header>

      <div className='tabs'>
        <button
          className={`tab ${activeTab === 'profiles' ? 'active' : ''}`}
          onClick={() => setActiveTab('profiles')}>
          👤 Profiles
        </button>
        <button
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}>
          📆 Events
        </button>
      </div>

      <div className='tab-content'>
        {activeTab === 'profiles' && (
          <ProfileManager
            onProfileSelect={handleProfileSelect}
            selectedProfile={selectedProfile}
          />
        )}

        {activeTab === 'events' && (
          <EventManager selectedProfile={selectedProfile} />
        )}
      </div>
    </div>
  );
}

export default App;

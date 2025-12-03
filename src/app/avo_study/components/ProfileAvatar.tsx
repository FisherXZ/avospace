'use client';

import './ProfileAvatar.css';

interface ProfileAvatarProps {
  username: string;
  size?: 'small' | 'medium' | 'large';
}

// Generate color based on username (consistent colors for same user)
function stringToColor(str: string): { from: string; to: string } {
  const colors = [
    { from: '#667eea', to: '#764ba2' }, // Purple
    { from: '#f093fb', to: '#f5576c' }, // Pink
    { from: '#4facfe', to: '#00f2fe' }, // Blue
    { from: '#43e97b', to: '#38f9d7' }, // Green
    { from: '#fa709a', to: '#fee140' }, // Pink-Yellow
    { from: '#30cfd0', to: '#330867' }, // Cyan-Purple
    { from: '#a8edea', to: '#fed6e3' }, // Mint-Pink
    { from: '#ff9a9e', to: '#fecfef' }, // Coral-Pink
    { from: '#ffecd2', to: '#fcb69f' }, // Peach
    { from: '#ff6e7f', to: '#bfe9ff' }, // Red-Blue
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export default function ProfileAvatar({ username, size = 'medium' }: ProfileAvatarProps) {
  const initial = username ? username.charAt(0).toUpperCase() : '?';
  const colors = stringToColor(username || 'default');

  return (
    <div 
      className={`profile-avatar profile-avatar-${size}`}
      style={{
        background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`
      }}
    >
      <span className="profile-avatar-initial">{initial}</span>
    </div>
  );
}





export const formatTimeAgo = (dateInput) => {
    // Convert the input to a Date object if it's not already one
    const date = dateInput instanceof Date 
        ? dateInput 
        : new Date(dateInput);
    
    const now = new Date();
    
    // Ensure the date is valid
    if (isNaN(date.getTime())) {
        return 'Invalid date';
    }

    const diffInSeconds = Math.floor((now - date) / 1000);
    
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];
  
    for (let interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }
  
    return 'just now';
  };
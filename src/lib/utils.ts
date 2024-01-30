import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export function formatDateString(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", options);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formattedDate} at ${time}`;
}

// 
export const multiFormatDateString = (timestamp: string = ""): string => {
  const timestampNum = Math.round(new Date(timestamp).getTime() / 1000);
  const date: Date = new Date(timestampNum * 1000);
  const now: Date = new Date();

  const diff: number = now.getTime() - date.getTime();
  const diffInSeconds: number = diff / 1000;
  const diffInMinutes: number = diffInSeconds / 60;
  const diffInHours: number = diffInMinutes / 60;
  const diffInDays: number = diffInHours / 24;

  switch (true) {
    case Math.floor(diffInDays) >= 30:
      return formatDateString(timestamp);
    case Math.floor(diffInDays) === 1:
      return `${Math.floor(diffInDays)} day ago`;
    case Math.floor(diffInDays) > 1 && diffInDays < 30:
      return `${Math.floor(diffInDays)} days ago`;
    case Math.floor(diffInHours) >= 1:
      return `${Math.floor(diffInHours)} hours ago`;
    case Math.floor(diffInMinutes) >= 1:
      return `${Math.floor(diffInMinutes)} minutes ago`;
    default:
      return "Just now";
  }
};

export const checkIsLiked = (likeList: string[], userId: string) => {
  return likeList.includes(userId);
};

export function formatDate(dateString: string): string {
  const currentDate = new Date();
  const inputDate = new Date(dateString);

  const timeDifference = currentDate.getTime() - inputDate.getTime();
  const secoundsDifference = timeDifference / 1000;

  if (secoundsDifference < 60) {
    return `${Math.floor(secoundsDifference)} secounds ago`;
  } else if (secoundsDifference < 3600) {
    const minutes = Math.floor(secoundsDifference / 60);
    return `${minutes} ${minutes === 1 ? 'minute': 'minutes'} ago`;
  } else if (secoundsDifference < 86400) {
    const hours = Math.floor(secoundsDifference / 3600);
    return `${hours} ${hours === 1 ? 'hour': 'hours'} ago`;
  } else if (secoundsDifference < 604800) {
    const days = Math.floor(secoundsDifference / 86400);
    return `${days} ${days === 1 ? 'day': 'days'} ago`;
  } else if (secoundsDifference < 2628000) {
    const weeks = Math.floor(secoundsDifference / 604800);
    return `${weeks} ${weeks === 1 ? 'week': 'weeks'} ago`;
  } else if (secoundsDifference < 31536000) {
    const months = Math.floor(secoundsDifference / 2628000);
    return `${months} ${months === 1 ? 'month': 'months'} ago`;
  } else {
    const years = Math.floor(secoundsDifference / 31536000);
    return `${years} ${years === 1 ? 'year': 'years'} ago`;
  }
}
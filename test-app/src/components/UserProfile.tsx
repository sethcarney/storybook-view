import React from "react";

interface UserProfileProps {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  isOnline?: boolean;
  showBadge?: boolean;
  size?: "small" | "medium" | "large";
  onClick?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  name,
  email,
  avatar,
  role,
  isOnline = false,
  showBadge = false,
  size = "medium",
  onClick
}) => {
  const sizeClasses = {
    small: {
      container: "p-3",
      avatar: "w-10 h-10",
      name: "text-sm font-medium",
      email: "text-xs text-gray-500",
      role: "text-xs text-gray-400"
    },
    medium: {
      container: "p-4",
      avatar: "w-12 h-12",
      name: "text-base font-medium",
      email: "text-sm text-gray-500",
      role: "text-sm text-gray-400"
    },
    large: {
      container: "p-6",
      avatar: "w-16 h-16",
      name: "text-lg font-medium",
      email: "text-base text-gray-500",
      role: "text-base text-gray-400"
    }
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 ${classes.container} ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div
            className={`${classes.avatar} rounded-full bg-gray-300 flex items-center justify-center overflow-hidden`}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  if (target.nextSibling) {
                    (target.nextSibling as HTMLElement).style.display = "flex";
                  }
                }}
              />
            ) : null}
            <div
              className={`${classes.avatar} rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold ${avatar ? "hidden" : ""}`}
              style={{ display: avatar ? "none" : "flex" }}
            >
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
          </div>

          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
          )}

          {showBadge && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              !
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`${classes.name} text-gray-900 truncate`}>{name}</p>
          <p className={`${classes.email} truncate`}>{email}</p>
          {role && <p className={`${classes.role} truncate`}>{role}</p>}
        </div>
      </div>
    </div>
  );
};

UserProfile.defaultProps = {
  isOnline: false,
  showBadge: false,
  size: "medium"
};

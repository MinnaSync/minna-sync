export function tryCatch<T>(fn: () => T) {
    try {
        const result = fn();

        return { result, error: null }
    } catch (e) {
        return { result: null, error: e as Error }
    }
}

type UserConfig = {
    username?: string;
};

export function getUserConfig(): UserConfig {
    const emptyConfig = JSON.stringify({
    } as UserConfig);

    return JSON.parse(sessionStorage.getItem("user_config") || emptyConfig);
}

export function setUserConfig(config: UserConfig) {
    let userConfig = getUserConfig();

    if (userConfig) {
        const newConfig = { ...userConfig, ...config };

        sessionStorage.setItem("user_config", JSON.stringify(newConfig));
        userConfig = newConfig;
    } else {
        sessionStorage.setItem("user_config", JSON.stringify(config));
        userConfig = config;
    }
    
    return userConfig;
}
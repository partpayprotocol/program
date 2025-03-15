export const getGeolocation = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve(`${latitude}, ${longitude}`);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    resolve("Location unavailable");
                }
            );
        } else {
            resolve("Geolocation not supported");
        }
    });
};
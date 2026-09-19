
export default async function handler(req, res) {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({
                error: "City name is required."
            });
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;

        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${apiKey}`
        );

        const data = await response.json();

        return res.status(response.status).json(data);

    } catch (error) {
        return res.status(500).json({
            error: "Unable to get city suggestions."
        });
    }
}

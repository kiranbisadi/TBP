import { useEffect, useState } from "react";
import api from "../services/api";

function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Get profile
  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(response.data.user);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle input
  const handleChange = (event) => {
    setProfile({
      ...profile,
      [event.target.name]: event.target.value,
    });
  };

  // Update profile
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await api.put(
        "/users/profile",
        {
          name: profile.name,
          phone: profile.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data.user);

      setMessage("Profile updated successfully");
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to update profile"
      );
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-10">
        Loading profile...
      </p>
    );
  }

  return (
    <div className="min-h-screen flex justify-center py-10">

      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">

        <h1 className="text-3xl font-bold mb-6 text-center">
          My Profile
        </h1>

        {message && (
          <p className="text-green-600 mb-4">
            {message}
          </p>
        )}

        {error && (
          <p className="text-red-600 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>

          <label className="block mb-2">
            Name
          </label>

          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-4"
            required
          />

          <label className="block mb-2">
            Email
          </label>

          <input
            type="email"
            value={profile.email}
            className="w-full border p-3 rounded mb-4 bg-gray-100"
            disabled
          />

          <label className="block mb-2">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-6"
            required
          />

          <button
            type="submit"
            className="w-full bg-red-600 text-white p-3 rounded"
          >
            Update Profile
          </button>

        </form>

      </div>

    </div>
  );
}

export default Profile;
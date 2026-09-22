function Home() {
    return (
        <div className="min-h-screen">

            <section className="bg-gray-800 text-white text-center py-20">

                <h1 className="text-4xl font-bold mb-4">
                    Book Your Movie Tickets
                </h1>

                <p className="text-gray-300 mb-6">
                    Find movies and book your seats easily.
                </p>

                <button
                    onClick={() => window.location.href = "/movies"}
                    className="bg-red-600 px-6 py-3 rounded"
                >
                    Explore Movies
                </button>

            </section>

        </div>
    );
}

export default Home;
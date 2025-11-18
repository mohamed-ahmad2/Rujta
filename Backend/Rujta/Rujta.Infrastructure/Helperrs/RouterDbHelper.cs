using Rujta.Infrastructure.Utiles;

namespace Rujta.Infrastructure.Helperrs
{
    public static class RouterDbHelper
    {
        /// <summary>
        /// Attempts to build the RouterDb from the given OSM file.
        /// Returns true if successful, false otherwise.
        /// </summary>
        public static bool BuildRouterDb()
        {
            try
            {
                // Current executing folder (usually bin\Debug\net8.0)
                string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;

                // Assuming the folder structure:
                string solutionRoot = Path.GetFullPath(Path.Combine(baseDirectory, @"..\..\..\..\"));
                string mapsFolder = Path.Combine(solutionRoot, "Rujta.API", "Maps");


                if (!Directory.Exists(mapsFolder))
                {
                    Console.WriteLine($"Maps folder not found: {mapsFolder}");
                    return false;
                }

                string osmFile = Path.Combine(mapsFolder, "egypt-251026.osm.pbf");
                string routerDbFile = Path.Combine(mapsFolder, "egypt.routerdb");

                if (!File.Exists(osmFile))
                {
                    Console.WriteLine($"❌ OSM file not found: {osmFile}");
                    return false;
                }

                Console.WriteLine($"OSM Path: {osmFile}");
                Console.WriteLine($"RouterDb Output: {routerDbFile}");

                // Build RouterDb
                ItineroMapBuilder.BuildRouterDb(osmFile, routerDbFile);

                if (File.Exists(routerDbFile))
                {
                    Console.WriteLine("RouterDb created successfully!");
                    return true;
                }
                else
                {
                    Console.WriteLine("RouterDb was NOT created!");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception during RouterDb build: {ex.Message}");
                return false;
            }
        }
    }
}

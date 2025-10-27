using Rujta.Infrastructure.Utiles;
using System;
using System.IO;

class Program
{
    static void Main()
    {
        // Current executing folder (usually bin\Debug\net8.0)
        string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;

        // Assuming the folder structure:
        // RouterDbBuilder/bin/Debug/net8.0 -> go up 4 levels to Rujta
        string solutionRoot = Path.GetFullPath(Path.Combine(baseDirectory, @"..\..\..\..\"));

        // Maps folder path
        string mapsFolder = Path.Combine(solutionRoot, "Rujta", "Maps");

        // Check if folder exists
        if (!Directory.Exists(mapsFolder))
        {
            Console.WriteLine($"❌ Maps folder not found: {mapsFolder}");
            return;
        }

        // File paths
        string osmFile = Path.Combine(mapsFolder, "egypt-251021.osm.pbf");
        string routerDbFile = Path.Combine(mapsFolder, "egypt.routerdb");

        // Check if OSM file exists
        if (!File.Exists(osmFile))
        {
            Console.WriteLine($"❌ OSM file not found: {osmFile}");
            return;
        }

        Console.WriteLine($"📍 OSM Path: {osmFile}");
        Console.WriteLine($"📍 RouterDb Output: {routerDbFile}");

        // Build RouterDb
        ItineroMapBuilder.BuildRouterDb(osmFile, routerDbFile);

        // Verify creation
        if (File.Exists(routerDbFile))
            Console.WriteLine("✅ RouterDb created successfully!");
        else
            Console.WriteLine("❌ RouterDb was NOT created!");
    }
}

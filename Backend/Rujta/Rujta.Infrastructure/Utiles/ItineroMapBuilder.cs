using Itinero;
using Itinero.IO.Osm;
using Itinero.Osm.Vehicles;
namespace Rujta.Infrastructure.Utiles
{
        public static class ItineroMapBuilder
        {
            public static void BuildRouterDb(string osmPbfPath, string outputRouterDbPath)
            {
                if (!File.Exists(osmPbfPath))
                {
                    Console.WriteLine("the file of Maps does not exist: " + osmPbfPath);
                    return;
                }

                Console.WriteLine("Start building (RouterDb)...");

                var routerDb = new RouterDb();

                using (var stream = new FileInfo(osmPbfPath).OpenRead())
                {
                    routerDb.LoadOsmData(stream, Vehicle.Car);
                }

                routerDb.Serialize(File.Open(outputRouterDbPath, FileMode.Create));

                Console.WriteLine("✅ Done RouterDb !");
                Console.WriteLine("📦 Route: " + outputRouterDbPath);
            }
        }
    }



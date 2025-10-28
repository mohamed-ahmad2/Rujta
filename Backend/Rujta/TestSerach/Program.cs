using FuzzySharp; // FuzzySharp NuGet
using FuzzySharp.SimilarityRatio;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;

namespace TestSerach
{
    public class Program
    {
        static List<string> GenerateDrugList(int count = 1000)
        {
            var prefixes = new[] {
            "Aceta", "Amoxi", "Cipro", "Doxi", "Flu", "Ibu", "Met", "Omep", "Lina", "Simva",
            "Ator", "Loper", "Ranit", "Clari", "Erythro", "Pred", "Hydro", "Naprox", "Lev", "Sertra"
        };
            var middles = new[] {
            "min", "cillin", "floxacin", "cycline", "lvir", "fen", "profen", "prazole", "statin",
            "olol", "pril", "sartan", "tidine", "romycin", "pred", "cort", "azole", "dine", "zepam"
        };
            var suffixes = new[] {
            "", " HCl", " Sodium", " XR", " SR", " 250mg", " 500mg", " oral", " syrup", " injection"
        };

            var single = new[] {
            "Paracetamol", "Ibuprofen", "Aspirin", "Metformin", "Amoxicillin",
            "Ciprofloxacin", "Omeprazole", "Atorvastatin", "Simvastatin", "Lisinopril",
            "Losartan", "Prednisone", "Azithromycin", "Clarithromycin", "Doxycycline",
            "Naproxen", "Levothyroxine", "Sertraline", "Fluconazole", "Ranitidine"
        }.ToList();

            var rand = new Random(12345); 
            var list = new List<string>(single);

            while (list.Count < count)
            {
               
                if (rand.NextDouble() < 0.15)
                {
                   
                    var baseName = single[rand.Next(single.Count)];
                    var modification = suffixes[rand.Next(suffixes.Length)];
                    list.Add(baseName + modification);
                }
                else
                {
                    var p = prefixes[rand.Next(prefixes.Length)];
                    var m = middles[rand.Next(middles.Length)];
                    var s = suffixes[rand.Next(suffixes.Length)];
                    var name = p + m + s;

                  
                    if (rand.NextDouble() < 0.25)
                    {
                        var other = single[rand.Next(single.Count)];
                        var sep = rand.NextDouble() < 0.5 ? " " : "-";
                        name = name + sep + other;
                    }

                  
                    if (rand.NextDouble() < 0.12)
                    {
                        name = IntroduceTypo(name, rand);
                    }

                    list.Add(name);
                }
            }

            return list.Take(count).ToList();
        }

      
        static string IntroduceTypo(string s, Random rand)
        {
            if (string.IsNullOrEmpty(s)) return s;
            var idx = rand.Next(s.Length);
            var c = (char)('a' + rand.Next(26));
            var arr = s.ToCharArray();
            arr[idx] = c;
            return new string(arr);
        }

       
        static double JaroWinkler(string s1, string s2, double prefixScale = 0.1)
        {
            if (s1 == s2) return 1.0;
            if (s1.Length == 0 || s2.Length == 0) return 0.0;

            int len1 = s1.Length, len2 = s2.Length;
            int matchDistance = Math.Max(len1, len2) / 2 - 1;
            var s1Matches = new bool[len1];
            var s2Matches = new bool[len2];

            int matches = 0;
            for (int i = 0; i < len1; i++)
            {
                int start = Math.Max(0, i - matchDistance);
                int end = Math.Min(i + matchDistance, len2 - 1);
                for (int j = start; j <= end; j++)
                {
                    if (s2Matches[j]) continue;
                    if (s1[i] != s2[j]) continue;
                    s1Matches[i] = true;
                    s2Matches[j] = true;
                    matches++;
                    break;
                }
            }

            if (matches == 0) return 0.0;

            double t = 0;
            int k = 0;
            for (int i = 0; i < len1; i++)
            {
                if (!s1Matches[i]) continue;
                while (!s2Matches[k]) k++;
                if (s1[i] != s2[k]) t++;
                k++;
            }
            t /= 2.0;

            double m = matches;
            double jaro = (m / len1 + m / len2 + (m - t) / m) / 3.0;

          
            int prefix = 0;
            for (int i = 0; i < Math.Min(4, Math.Min(s1.Length, s2.Length)); i++)
            {
                if (s1[i] == s2[i]) prefix++; else break;
            }

            return jaro + prefix * prefixScale * (1 - jaro);
        }

      
        static double JaccardSimilarity(string a, string b)
        {
            var setA = new HashSet<string>(Tokenize(a));
            var setB = new HashSet<string>(Tokenize(b));
            if (setA.Count == 0 && setB.Count == 0) return 1.0;
            if (setA.Count == 0 || setB.Count == 0) return 0.0;
            var inter = setA.Intersect(setB).Count();
            var uni = setA.Union(setB).Count();
            return (double)inter / uni;
        }

        static IEnumerable<string> Tokenize(string s)
        {
            return s
                .ToLowerInvariant()
                .Split(new char[] { ' ', '-', '_', ',', '.' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim());
        }

        
        class PerfResult
        {
            public string MethodName { get; set; } = "";
            public double TotalMilliseconds { get; set; }
            public double AvgMillisecondsPerComparison { get; set; }
            public double OpsPerSecond { get; set; }
            public List<(string item, double score)> TopResults { get; set; } = new List<(string, double)>();
        }

        static PerfResult RunAndMeasure(
            string methodName,
            List<string> dataset,
            string query,
            Func<string, string, double> similarityFunc,
            int topK = 10)
        {
            var sw = Stopwatch.StartNew();
            var results = new List<(string item, double score)>(dataset.Count);
            foreach (var item in dataset)
            {
                double score = similarityFunc(query, item);
                results.Add((item, score));
            }
            sw.Stop();

            var ordered = results.OrderByDescending(r => r.score).ThenBy(r => r.item).ToList();

            var res = new PerfResult
            {
                MethodName = methodName,
                TotalMilliseconds = sw.Elapsed.TotalMilliseconds,
                AvgMillisecondsPerComparison = sw.Elapsed.TotalMilliseconds / dataset.Count,
                OpsPerSecond = dataset.Count / sw.Elapsed.TotalSeconds,
                TopResults = ordered.Take(topK).ToList()
            };
            return res;
        }

        
        static void Main(string[] args)
        {
           
            var dataset = GenerateDrugList(1000);

            
            var queries = new[] {

            "tcemanieoph erepeclatmo", 
            "Amoxcillin" 
        };

            
            var csvLines = new List<string>();
            csvLines.Add("Method,Query,TotalMs,AvgMsPerComparison,OpsPerSecond,Top1,Top1Score,Top2,Top2Score,Top3,Top3Score");

           
            foreach (var query in queries)
            {
                Console.WriteLine(new string('-', 80));
                Console.WriteLine($"Query: \"{query}\"");
                Console.WriteLine(new string('-', 80));

                // 1) FuzzySharp Ratio (Levenshtein-based ratio)
                var r1 = RunAndMeasure("FuzzySharp-Ratio", dataset, query, (q, s) =>
                {
                    return Fuzz.Ratio(q, s);
                });
                PrintResult(r1);
                csvLines.Add(ToCsvLine(r1, query));

                // 2) FuzzySharp-PartialRatio
                var r2 = RunAndMeasure("FuzzySharp-PartialRatio", dataset, query, (q, s) =>
                {
                    return Fuzz.PartialRatio(q, s);
                });
                PrintResult(r2);
                csvLines.Add(ToCsvLine(r2, query));

                // 3) FuzzySharp-TokenSortRatio
                var r3 = RunAndMeasure("FuzzySharp-TokenSortRatio", dataset, query, (q, s) =>
                {
                    return Fuzz.TokenSortRatio(q, s);
                });
                PrintResult(r3);
                csvLines.Add(ToCsvLine(r3, query));

                // 4) FuzzySharp-TokenSetRatio
                var r4 = RunAndMeasure("FuzzySharp-TokenSetRatio", dataset, query, (q, s) =>
                {
                    return Fuzz.TokenSetRatio(q, s);
                });
                PrintResult(r4);
                csvLines.Add(ToCsvLine(r4, query));

                

                // 6) Jaro-Winkler (custom implementation yields 0..1, scale to 0..100)
                var r6 = RunAndMeasure("Jaro-Winkler", dataset, query, (q, s) =>
                {
                    return JaroWinkler(q.ToLowerInvariant(), s.ToLowerInvariant()) * 100.0;
                });
                PrintResult(r6);
                csvLines.Add(ToCsvLine(r6, query));

                // 7) Jaccard (token-set) -> 0..1 scaled
                var r7 = RunAndMeasure("Jaccard-TokenSet", dataset, query, (q, s) =>
                {
                    return JaccardSimilarity(q, s) * 100.0;
                });
                PrintResult(r7);
                csvLines.Add(ToCsvLine(r7, query));

                // 8) Example of fuzzy match using scorer strategy: PartialRatioScorer vs default
                var r8 = RunAndMeasure("FuzzySharp-WeightedPartialScorer", dataset, query, (q, s) =>
                {
                    // using internal scorer setup - fallback to TokenSetRatio if available
                    return Fuzz.WeightedRatio(q, s);
                });
                PrintResult(r8);
                csvLines.Add(ToCsvLine(r8, query));

                // 9) Hybrid Matcher (Jaro-Winkler + TokenSort + TokenSet)
                var r9 = RunAndMeasure("Hybrid-Matcher", dataset, query, (q, s) =>
                {
                    return HybridMatcher.HybridScore(q, s);
                });
                PrintResult(r9);
                csvLines.Add(ToCsvLine(r9, query));

                // 10) Pure Jaro-Winkler Only
                var r10 = RunAndMeasure("Pure-JaroWinkler", dataset, query, (q, s) =>
                {
                    var jaro = new F23.StringSimilarity.JaroWinkler();
                    return jaro.Similarity(q.ToLower(), s.ToLower()) * 100.0;
                });
                PrintResult(r10);
                csvLines.Add(ToCsvLine(r10, query));

                // 11) Word-Level Jaro-Winkler
                var r11 = RunAndMeasure("WordLevel-JaroWinkler", dataset, query, (q, s) =>
                {
                    var jaro = new F23.StringSimilarity.JaroWinkler();

                   
                    var queryWords = q.Split(' ', StringSplitOptions.RemoveEmptyEntries);


                    if (queryWords.Length == 1)
                        return jaro.Similarity(q.ToLower(), s.ToLower()) * 100.0;


                    double totalScore = 0;
                    foreach (var word in queryWords)
                    {
                        double maxForWord = dataset
                            .Select(candidate => jaro.Similarity(word.ToLower(), candidate.ToLower()) * 100.0)
                            .Max();

                        totalScore += maxForWord;
                    }
                    double avgScore = totalScore / queryWords.Length;
                    return avgScore;
                });

                PrintResult(r11);
                csvLines.Add(ToCsvLine(r11, query));


                // 12) Word-Level Reconstruction (Closest per word)
                var r12 = RunAndMeasure("WordReconstruct-JaroWinkler", dataset, query, (q, s) =>
                {
                    var jaro = new F23.StringSimilarity.JaroWinkler();

                    var queryWords = q.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    if (queryWords.Length == 0)
                        return 0.0;

                    List<string> reconstructedWords = new List<string>();
                    double totalScore = 0;

                    foreach (var word in queryWords)
                    {
                        var bestMatch = dataset
                            .Select(candidate => new
                            {
                                Candidate = candidate,
                                Score = jaro.Similarity(word.ToLower(), candidate.ToLower()) * 100.0
                            })
                            .OrderByDescending(x => x.Score)
                            .First();

                        reconstructedWords.Add(bestMatch.Candidate);
                        totalScore += bestMatch.Score;
                    }

                    string reconstructed = string.Join(" ", reconstructedWords);

                    double avgScore = totalScore / queryWords.Length;

                    Console.WriteLine($"Reconstructed Query → {reconstructed}");

                    return avgScore;
                });

                PrintResult(r12);
                csvLines.Add(ToCsvLine(r12, query));


            }

           
            var outPath = Path.Combine(Directory.GetCurrentDirectory(), "fuzzy_results.csv");
            File.WriteAllLines(outPath, csvLines);
            Console.WriteLine();
            Console.WriteLine($"Results written to: {outPath}");
            Console.WriteLine("Done.");
        }

        static void PrintResult(PerfResult r)
        {
            Console.WriteLine($"Method: {r.MethodName}");
            Console.WriteLine($"Total time: {r.TotalMilliseconds:F2} ms | Avg/comparison: {r.AvgMillisecondsPerComparison:F4} ms | Ops/s: {r.OpsPerSecond:F1}");
            Console.WriteLine("Top results:");
            int i = 1;
            foreach (var t in r.TopResults)
            {
                Console.WriteLine($"  {i++:00}. {t.item}  => {t.score:F2}");
            }
            Console.WriteLine();
        }

        static string ToCsvLine(PerfResult r, string query)
        {
            var top = r.TopResults;

            string Safe(string s)
            {
                return "\"" + s.Replace("\"", "\"\"") + "\"";
            }

            string t1 = top.Count > 0 ? top[0].item : "";
            string s1 = top.Count > 0 ? top[0].score.ToString("F2") : "";
            string t2 = top.Count > 1 ? top[1].item : "";
            string s2 = top.Count > 1 ? top[1].score.ToString("F2") : "";
            string t3 = top.Count > 2 ? top[2].item : "";
            string s3 = top.Count > 2 ? top[2].score.ToString("F2") : "";
            return $"{r.MethodName},{Safe(query)},{r.TotalMilliseconds:F2},{r.AvgMillisecondsPerComparison:F6},{r.OpsPerSecond:F2},{Safe(t1)},{s1},{Safe(t2)},{s2},{Safe(t3)},{s3}";
        }

    }
}
using F23.StringSimilarity;
using FuzzySharp;
using SimMetrics.Net.Metric;
using System.Diagnostics;


namespace TestSerach
{
    public static class Program
    {
        static void Main()
        {
            string filePath = "dataset.txt"; 

            var dataset = File.ReadAllLines(filePath)
                .Where(line => !string.IsNullOrWhiteSpace(line))
                .Select(line =>
                {
                    var parts = line.Split('|');
                    if (parts.Length != 3)
                        throw new FormatException($"Invalid line format: {line}");

                    string s1 = parts[0].Trim();
                    string s2 = parts[1].Trim();
                    bool isMatch = bool.Parse(parts[2].Trim().ToLower());

                    return (s1, s2, isMatch);
                })
                .ToList();

            var metrics = new Dictionary<string, Func<string, string, double>>()
            { 
                //FuzzySharp Algorithms
                {"Ratio", (a, b) => Fuzz.Ratio(a, b)},
                {"PartialRatio", (a, b) => Fuzz.PartialRatio(a, b)},
                {"TokenSortRatio", (a, b) => Fuzz.TokenSortRatio(a, b)},
                {"TokenSetRatio", (a, b) => Fuzz.TokenSetRatio(a, b)},
                {"WeightedRatio (FuzzyMatch)", (a, b) => Fuzz.WeightedRatio(a, b)},

                //Edit Distance & Character-level
                {"Levenshtein", (a, b) => new Levenstein().GetSimilarity(a, b) * 100},
                
                {"SmithWaterman", (a, b) => new SmithWaterman().GetSimilarity(a, b) * 100},
                {"LCS (Longest Common Subsequence)", (a, b) => TestSearch.LongestCommonSubsequence.GetSimilarityScore(a, b) * 100},

                //Phonetic & Character overlap
                {"JaroWinkler_NetM", (a, b) => new SimMetrics.Net.Metric.JaroWinkler().GetSimilarity(a, b) * 100},
                {"JaroWinkler_F23", (a, b) => new F23.StringSimilarity.JaroWinkler().Similarity(a, b) * 100},
                //New Hybrid Algorithm
                {"Hybrid (JaroWinkler + Levenshtein)", (a, b) =>
{
                    double jw = new SimMetrics.Net.Metric.JaroWinkler().GetSimilarity(a, b);
                    double lev = new Levenstein().GetSimilarity(a, b);
                    return ((jw * 0.75) + (lev * 0.25)) * 100;
                }},
                {"Jaccard", (a, b) => new JaccardSimilarity().GetSimilarity(a, b) * 100},
                {"Dice (Bigram)", (a, b) => new DiceSimilarity().GetSimilarity(a, b) * 100},
                
            };


            double threshold = 80;
            const double epsilon = 1e-9; 

            Console.WriteLine("String Similarity Evaluation Report 2000 row\n");
            Console.WriteLine($"Threshold: {threshold}%");
            Console.WriteLine("=".PadLeft(70, '='));

            foreach (var metric in metrics)
            {
                int TP = 0, FP = 0, TN = 0, FN = 0;

                long memoryBefore = GC.GetTotalMemory(false);
                var stopwatch = Stopwatch.StartNew();

                foreach (var (s1, s2, isMatch) in dataset)
                {
                    double score = metric.Value(s1, s2);
                    bool predicted = score >= threshold;

                    if (predicted && isMatch) TP++;
                    else if (predicted && !isMatch)
                    {
                        FP++;
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.WriteLine($"[FP] \"{s1}\" vs \"{s2}\" | Score: {score:F2}% | Should be: False");
                        Console.ResetColor();
                    }
                    else if (!predicted && !isMatch) TN++;
                    else
                    {
                        FN++;
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine($"[FN] \"{s1}\" vs \"{s2}\" | Score: {score:F2}% | Should be: True");
                        Console.ResetColor();
                    }
                }



                stopwatch.Stop();
                long memoryAfter = GC.GetTotalMemory(false);
                long memoryUsed = memoryAfter - memoryBefore;

                
                double accuracy = Math.Round((double)(TP + TN) / (TP + TN + FP + FN), 4);
                double precision = (TP + FP) < epsilon ? 0 : Math.Round((double)TP / (TP + FP), 4);
                double recall = (TP + FN) < epsilon ? 0 : Math.Round((double)TP / (TP + FN), 4);
                double denominator = precision + recall;
                double f1 = Math.Abs(denominator) < epsilon ? 0 : Math.Round(2 * (precision * recall) / denominator, 4);

                Console.WriteLine($"\n {metric.Key}");
                Console.WriteLine($"TP={TP}, FP={FP}, TN={TN}, FN={FN}");
                Console.WriteLine($"Accuracy : {accuracy:F2}");
                Console.WriteLine($"Precision: {precision:F2}");
                Console.WriteLine($"Recall   : {recall:F2}");
                Console.WriteLine($"F1-Score : {f1:F2}");
                Console.WriteLine($" Time   : {stopwatch.ElapsedMilliseconds} ms");
                Console.WriteLine($" Memory : {memoryUsed / 1024.0:F2} KB");
                Console.WriteLine("-".PadLeft(70, '-'));
            }
        }
    }
}

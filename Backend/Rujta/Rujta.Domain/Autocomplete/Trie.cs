using System.Security.Cryptography.X509Certificates;

namespace Rujta.Domain.Autocomplete
{
    public class Trie
    {
        private readonly TrieNode _root = new TrieNode();

        public void Insert(string word)
        {
            if (string.IsNullOrWhiteSpace(word))
                throw new ArgumentException("Word cannot be null or empty.", nameof(word));

            var current = _root;

            foreach (var ch in Normalize(word))
            {
                if (!current.Children.TryGetValue(ch, out var next))
                {
                    next = new TrieNode();
                    current.Children[ch] = next; // Or Add(ch, next)
                }

                current = next;
            }

            current.IsEndOfWord = true;
        }

        public bool Search(string word)
        {
            var node = FindNode(word);
            return node is not null && node.IsEndOfWord;
        }

        public bool StartsWith(string prefix)
        {
            return FindNode(prefix) is not null;
        }

        private TrieNode? FindNode(string input)
        {
            if(string.IsNullOrWhiteSpace(input))
                return null;

            var current = _root;

            foreach (var ch in Normalize(input))
            {
                if (!current.Children.TryGetValue(ch, out var next))
                    return null;

                current = next;
            }

            return current;
        }

        public List<string> GetWordsByPrefix(string prefix, int maxResults = 10)
        {
            if (maxResults <= 0)
                throw new ArgumentOutOfRangeException(nameof(maxResults));

            var results = new List<string>();
            var node = FindNode(prefix);

            if (node is null)
                return results;

            var normalizedPrefix = Normalize(prefix);

            var stack = new Stack<(TrieNode Node, string Word)>();
            stack.Push((node, normalizedPrefix));

            while (stack.Count > 0 && results.Count < maxResults)
            {
                var (currentNode, currentWord) = stack.Pop();

                if (currentNode.IsEndOfWord)
                    results.Add(currentWord);

                foreach (var child in currentNode.Children)
                    stack.Push((child.Value, currentWord + child.Key));
            }

            return results;
        }

        private static string Normalize(string input) =>
            input.Trim().ToLowerInvariant();
        
    }
}

import { StanProvider } from "./stan-provider";

test("small client for stan as", async () => {
  const stanProvider = new StanProvider();
  const stanIsDown = !(await stanProvider.getVersion());
  if (stanIsDown) {
    return; // test pass
  }

  await stanProvider.train(
    {
      language: "en",
      topics: [
        {
          name: "global",
          intents: [
            {
              name: "fruit-is-moldy",
              examples: [
                "fruit is moldy",
                "this fruit is moldy",
                "this $moldy_fruit is not good to eat",
                "theses $moldy_fruit have passed",
                "theses $moldy_fruit look bad",
                "theses $moldy_fruit look soo moldy",
              ],
              variables: [
                {
                  name: "moldy_fruit",
                  variableType: "fruits",
                },
              ],
            },
            {
              name: "hello",
              variables: [],
              examples: [
                "good day!",
                "good morning",
                "holla",
                "bonjour",
                "hey there",
                "hi bot",
                "hey bot",
                "hey robot",
                "hey!",
                "hi",
                "hello",
              ],
            },
            {
              name: "talk-to-manager",
              examples: [
                "talk to manager",
                "I want to talk to the manager",
                "Who's your boss?",
                "Can talk to the person in charge?",
                "I'd like to speak to your manager",
                "Can I talk to your boss? plz",
                "I wanna speak to manager please",
                "let me speak to your fucking boss or someone",
              ],
              variables: [],
            },
            {
              name: "where-is",
              examples: [
                "where is $thing_to_search ?",
                "where are $thing_to_search ?",
                "can you help me find $thing_to_search ?",
                "I'm searching for $thing_to_search ?",
                "where is the $thing_to_search ?",
                "where are the $thing_to_search ?",
              ],
              variables: [
                {
                  name: "thing_to_search",
                  variableType: "fruits",
                },
              ],
            },
          ],
        },
      ],
      enums: [
        {
          name: "fruits",
          fuzzy: 0.9,
          values: [
            { name: "banana", synonyms: ["bananas"] },
            { name: "apple", synonyms: ["apples"] },
            { name: "grape", synonyms: ["grapes"] },
          ],
        },
      ],
      seed: 42,
      patterns: [],
    },
    (time: number) => {
      console.log(`training... ${time / 1000}s`);
    }
  );

  const { success, prediction } = await stanProvider.predict(
    "theses bananas are modly"
  );

  expect(success).toBe(true);
  console.log(prediction);
});

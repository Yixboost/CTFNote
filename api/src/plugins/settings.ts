import { makeExtendSchemaPlugin, gql } from "graphile-utils";

const settings = {
  allowRegistration: true,
};

let settingsFetched = false;

function convertType(obj: string | number | boolean) {
  switch (typeof obj) {
    case "string":
      return "String";
    case "number":
      return Number.isInteger(obj) ? "Int" : "Float";
    case "boolean":
      return "Boolean";
  }
}

export default makeExtendSchemaPlugin(() => {
  const fieldList = Object.entries(settings).map(
    ([name, value]) => `${name}: ${convertType(value)}`
  );

  return {
    typeDefs: gql`     
                type Settings {
                    ${fieldList.map((s) => `${s}!`).join("\n")}
                }
        
                extend type Query {
                    settings : Settings!
                }
                
                input SettingsInput {
                    ${fieldList.join("\n")}
                }
        
                type updateSettingsPayload {
                    settings: Settings!
                }
        
                extend type Mutation {
                    updateSettings(input: SettingsInput!) : updateSettingsPayload!
                }
                `,
    resolvers: {
      Query: {
        settings: async (_query, _args, context) => {
          const { pgClient } = context;
          if (!settingsFetched) {
            // Fetch the settings the first time they are requested
            const response = await pgClient.query(
              `SELECT settings FROM ctfnote_private.settings;`
            );
            const savedSettings = response.rows[0].settings;
            Object.assign(settings, savedSettings);
            settingsFetched = true;
          }
          // deliver from cache
          return settings;
        },
      },
      Mutation: {
        updateSettings: async (_query, { input }, { pgClient }) => {
          // Update the cache
          Object.assign(settings, input);

          // Save the cache to the db
          await pgClient.query("SELECT ctfnote_private.update_settings($1);", [
            JSON.stringify(settings),
          ]);
          return { settings };
        },
      },
    },
  };
});

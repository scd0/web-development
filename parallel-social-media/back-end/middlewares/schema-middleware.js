export default function schemaMiddleware(schema) {
  schema.pre("save", function (next) {
    const document = this;

    Object.keys(document.schema.paths).forEach((field) => {
      const value = document[field];

      if (typeof value == "string") {
        document[field] = value.trim();
      }
    });
    
    next();
  });
}

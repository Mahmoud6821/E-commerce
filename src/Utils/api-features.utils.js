class ApiFeatures {
  constructor(model, query, populate) {
      //? Product | Category | SubCategory |...
      this.model = model;
      //? req.query
      this.query = query;
      //? Will be the filters we needed to apply | {}
      this.filterObject = {};
      //? Will be the pagination object we needed to apply | {}
      this.paginationObject = {};
      //? Will be populated data we needed to apply | []
      this.populate = populate;
  }
  
  //# pagination
  pagination() {
      let { page = 1, limit = 2 } = this.query;
      if (page < 1) page = 1;
      if (limit < 1) limit = 2;
      let skip = (page - 1) * limit;

      this.paginationObject = {
          limit: parseInt(limit),
          skip,
          page: parseInt(page),
      };

      //? populate in pagination
      if (this.populate) {
          this.paginationObject.populate = this.populate;
      }

      console.log(
          "============ paginationObject in pagination() ==========",
          this.paginationObject
      );

      this.mongooseQuery = this.model.paginate(
          this.filterObject,
          this.paginationObject
      );
      return this;
  }

  //# sorting
  sort() {
      const { sort } = this.query;

      if (sort) {
          this.paginationObject.sort = sort;

          console.log(
              "============ paginationObject in sort()==========",
              this.paginationObject
          );

          //? populate in pagination
          if (this.populate) {
              this.paginationObject.populate = this.populate;
          }

          this.mongooseQuery = this.model.paginate(
              this.filterObject,
              this.paginationObject
          );
      }
      return this;
  }

  //# search
  search() {
      const { search } = this.query;

      if (search) {
          this.filterObject = {
              $or: [
                  {
                      title: { $regex: search, $options: "i" },
                  },
                  {
                      description: { $regex: search, $options: "i" },
                  },
                  {
                      name: { $regex: search, $options: "i" }
                  },
              ],
          };

          console.log(
              "============ filterObject in search() ==========",
              this.filterObject,search
          );

          //? populate in pagination
          if (this.populate) {
              this.paginationObject.populate = this.populate;
          }

          this.mongooseQuery = this.model.paginate(
              this.filterObject,
              this.paginationObject
          );
      }
      return this;
  }

  //# filtering
  filters() {
      let { page = 1, limit = 2, sort, search, ...filters } = this.query;
      if (page < 1) page = 1;
      if (limit < 1) limit = 2;

      const filtersAsString = JSON.stringify(filters);
      const replacedFilters = filtersAsString.replace(
          /lt|lte|gt|gte|eq|ne|regex/g,
          (match) => `$${match}`
      );
      this.filterObject = JSON.parse(replacedFilters);

      console.log(
          "============ filterObject in filters() ==========",
          this.filterObject
      );

      //? populate in pagination
      if (this.populate) {
          this.paginationObject.populate = this.populate;
      }

      this.mongooseQuery = this.model.paginate(
          this.filterObject,
          this.paginationObject
      );
      return this;
  }
}

export { ApiFeatures };
(function() {

    var User = Backbone.Model.extend({
        schema: null
    });


    var SpiralGeneticsLoginController = {

        init: function(spec) {
            sgcl.this = sgcl.User({}).fetch();
        }
            
    }

    var SpiralGenetics = Backbone.Controller.extend({
        
        routes: {
            "": "dashboard",
            "!pipelines": pipelines,
            "!pipeline/:pipeline", pipeline,
            "!datasets": datasets,
            
        },

        dashboard: function() {

        },

        pipelines: function() {
        
        },

        pipeline: function(pipeline_url) {

        },

        datasets: function(dataset_url) {

        },

        jobs: function() {

        },

        job: function(job_url) {

        }

    });

        
        

    $(document).ready(function() {
        app = SpiralGenetics.init();
    }
})();
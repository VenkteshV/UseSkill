var categoryOptions = { 'categories' : [
  {
    'id' : 1,
    'name' : 'Graphics & Design',
    'subcategories' : ['Logo Design', 'Business Cards and Stationery','Illustration','Cartoons & Caricatures','Flyers & Bronchures','Book & Album Covers',' Web & Mobile Design','Social Media Design','Banner Ads','UI/UX Designs','Photoshop Editing','Photography','3D & 2D Models','T-Shirts & Merchandise','Presentation Design','Info Graphics','Vector Tracing','Invitations','Audio/Video Production']
  },

  {
    'id' : 2,
    'name' : 'Digital Marketing',
    'subcategories' : ['SEO', 'Social Media Marketing','Email marketing','Content Marketing','Video Marketing','Web Analytics','Local Listings','Domain Research','Search & Display Marketing', 'Marketing Strategy', 'E-commerce Marketing','Influencer Marketing','Web Traffic', 'Mobile Advertising', 'Music Promotion']
  },
  {
    'id' : 3,
    'name' : 'Writing & Translation',
    'subcategories' : ['Articles & Blog Posts', 'Academic Writing and Research','Business Copywriting', 'Resumes & Cover Letters', 'Research & Summaries', 'Translation','Creative Writing', 'Proofreading & Editing','Press Releases', 'Transcription', 'Legal Writing','Technical Writing']
  },
 {
    'id' : 4,
    'name' : 'Video & Animation',
    'subcategories': ['Whiteboard & Animated Explainers','Intros & Animated Logos','Promotional Videos','Live Action Explainers','Short Video Ads','Spokesperson Videos','Editing & Post Production','Lyric & Music Videos','Animated Characters & Modelling']
},
{
   'id': 5,
   'name': 'Music & Audio',
   'subcategories': ['Voice Over','Mixing & Mastering','Producers & Composers','Singer-Songwriters','Session Musicians & Singers','Jingles & Drops','Sound Effects']
},
{
    'id' : 6,
    'name' : 'Programming & Tech',
    'subcategories': ['WordPress','Website Builders & CMS','Web Programming','Ecommerce','Mobile Apps & Web','Desktop applications','IT & Networking','Chat bots','Data Analytics & Reports','Convert Files','Databases','User Testing','QA','Other']
},
{
    'id' : 7,
    'name' : 'Business',
    'subcategories': ['Virtual Assistant','Market Research','Business Plans','Branding Services','Legal Consulting','Financial Consulting','Business Tips','Presentations','Career Advice','Flyer Distribution','Other']
},
{
   'id' : 8,
   'name' : 'Fun & Lifestyle',
   'subcategories': ['Online Lessons','Arts & Crafts','Relationship Advice','Health, Nutrition & Fitness','Astrology & Readings','Spiritual & Healing','Family & Genealogy','Gaming','Greeting Cards & Videos','Your Message On…','Viral Videos','Pranks & Stunts','Celebrity Impersonators','Collectibles','Global Culture','Other']
},
]
};
var options = categoryOptions.categories;
var category = document.getElementById('category');
console.log('category',category);
category.addEventListener('change', function(event) {
    event.preventDefault();
  console.log('hi');
        if (event.target.value.length == 0) document.getElementById("sub_categories").innerHTML = "<option></option>";
        else {
            var catOptions = [];
            var categoryWithSelectedValue = {};
             options.forEach(function(category) {
               console.log('*******',event.target.value,category,options);
              if(category.name == event.target.value)
                categoryWithSelectedValue = category;
            });
            console.log('categoryWithSelectedValue',categoryWithSelectedValue,categoryWithSelectedValue.id);
            for (categoryId in categoryWithSelectedValue.subcategories) {
              console.log('categoryId',categoryId);
                catOptions += "<option>" + categoryWithSelectedValue.subcategories[categoryId] + "</option>";
            }
            console.log('catOptions',catOptions);
            document.getElementById("sub_categories").innerHTML = catOptions;
        }
    });

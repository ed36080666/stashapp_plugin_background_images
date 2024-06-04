const PLUGIN_ID = 'background-image';
let ENTITY_ID;
let GALLERY_MODE = false;
let UNIQUE_PERFORMER_PAGE = false;
let GLOBAL_BACKGROUND_IMAGE = null;
let PERFORMER_BACKGROUND_IMAGE = null;
let PERFORMER_GALLERY_MODE = false;
let PERFORMER_ENTITY_ID = null;
let VIEWING_BACKGROUND = false;

const main = async () => {
    while (!document.querySelector('#root')) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // retrieve plugin settings
    const plugins = await makeRequest(configRequest);

    ENTITY_ID = plugins?.data?.configuration?.plugins?.[PLUGIN_ID]?.id;

    if (!ENTITY_ID) {
        console.error('No ID set for Background Images plugin.');
        return;
    }

    GALLERY_MODE = Boolean(plugins?.data?.configuration?.plugins?.[PLUGIN_ID]?.mode);

    // retrieve a random global image to set as background (if exists)
    const images = await makeRequest(imageRequest());
    GLOBAL_BACKGROUND_IMAGE = images?.data?.findImages?.images?.[0]?.paths?.image;

    UNIQUE_PERFORMER_PAGE = Boolean(plugins?.data?.configuration?.plugins?.[PLUGIN_ID]?.performerPage);
    PERFORMER_GALLERY_MODE = Boolean(plugins?.data?.configuration?.plugins?.[PLUGIN_ID]?.performerPageEntity);
    PERFORMER_ENTITY_ID = plugins?.data?.configuration?.plugins?.[PLUGIN_ID]?.performerPageId ?? null;

    // if using unique performer backgrounds, a mutation observer will set backgrounds so we can 
    // watch page title for navigation to performer pages to swap unique backgrounds.
    if (UNIQUE_PERFORMER_PAGE) {
        const observer = new MutationObserver(onPageNavigation);

        observer.observe(document.querySelector('title'), { subtree: true, characterData: true, childList: true });

        // to resolve issue w/ refreshes on performer page not triggering mutation observer, call it manually on initial load if image already not set.
        if (!PERFORMER_BACKGROUND_IMAGE) {
            onPageNavigation();
        }
    } else {
        // if not using unique performer backgrouns, we don't need an observer and can set global image once and be done.
        setBackground(GLOBAL_BACKGROUND_IMAGE);
    }

    // create a button to toggle view of background image in the nav
    setupViewBackgroundButton();
};

/**
 * Handler for mutation observer watching page title for unique performer background mode.
 */
const onPageNavigation = async () => {
    // if on a performer page, lookup unique background for that performer.
    if (location.href.includes('/performers/')) {
        const performerId = location.href.split('/')[4]?.split('?')[0];
        const images = await makeRequest(imageRequest(performerId));
        PERFORMER_BACKGROUND_IMAGE = images?.data?.findImages?.images?.[0]?.paths?.image;
        setBackground(PERFORMER_BACKGROUND_IMAGE);
    } else {
        // when not on performer page, flip back to the global image we loaded in main()
        PERFORMER_BACKGROUND_IMAGE = null;
        setBackground(GLOBAL_BACKGROUND_IMAGE);
    }
};

/**
 * Set the background image by flipping CSS variable.
 * @param {string|null} img 
 */
const setBackground = (img) => {
    root.style.setProperty('--background-image', `url(${img || ''})`);
};

/**
 * Create and prepend the button to view background in the nav bar utilities.
 */
setupViewBackgroundButton = () => {
    const parentNode = document.querySelector('.navbar-buttons');
    const node = document.createElement('button');
    node.classList = 'nav-utility btn minimal background-image-plugin__view';
    node.innerHTML = '&#x1f441;&#xfe0e;';
    node.title = 'Display background image.';

    node.addEventListener('click', onViewBackground);

    parentNode.prepend(node);
};

const onViewBackground = () => {
    if (VIEWING_BACKGROUND) {
        VIEWING_BACKGROUND = false;
        root.style.setProperty('--background-opacity', 0.3);
        document.querySelector('.main').style.opacity = 1;
        document.removeEventListener('keydown', escapeListener);
    } else {
        VIEWING_BACKGROUND = true;
        root.style.setProperty('--background-opacity', 1);
        document.querySelector('.main').style.opacity = 0;
        document.addEventListener('keydown', escapeListener);
    }
};

const escapeListener = (e) => {
    if (e.key === 'Escape') {
        onViewBackground();
    }
};

const makeRequest = async (request) => {
    const response = await fetch(`${window.location.origin}/graphql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        body: JSON.stringify(request)
    });

    return response.json();
};

const configRequest = {
    operationName: "Configuration",
    variables: {},
    query: `
    query Configuration {
      configuration {
        plugins
      }
    }`,
};


const imageRequest = (performerId) => {
    const query = `
    query FindImages($filter: FindFilterType, $image_filter: ImageFilterType, $image_ids: [Int!]) {
      findImages(filter: $filter, image_filter: $image_filter, image_ids: $image_ids) {
        images {
          id
          paths {
            thumbnail
            image
          }
        } 
      }
    }
  `;

    let isGalleryMode = GALLERY_MODE;
    let entityId = ENTITY_ID;

    // if performerId is given we are in unique background for performer page mode. in this case
    // tailor the query to use performer mode options (falling back to global mode options).
    if (performerId) {
        isGalleryMode = PERFORMER_GALLERY_MODE;
        entityId = PERFORMER_ENTITY_ID ?? ENTITY_ID;
    }

    const request = {
        operationName: 'FindImages',
        query,
        variables: {
            filter: {
                direction: 'ASC',
                page: 1,
                per_page: 1,
                sort: "random"
            },
            image_filter: {
                [isGalleryMode ? 'galleries' : 'tags']: {
                    value: [entityId],
                    modifier: "INCLUDES_ALL",
                }
            }
        }
    };

    if (performerId) {
        request.variables.image_filter.performers = {
            value: [performerId],
            excludes: [],
            modifier: 'INCLUDES_ALL'
        }
    }

    return request;
};

main();
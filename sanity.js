import {
    createImageUrlBuilder,
    createCurrentUserHook,
    createClient,
} from 'next-sanity'

export const config = {
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    apiVersion: '2021-03-25',
    useCdn: process.env.NODE_ENV === 'production',
} //project config object

export const sanityClient = createClient(config) //fetch information, make queries etc (equivalent to initializing a firebase app)
export const urlFor = (source) => createImageUrlBuilder(config).image(source) // to retrieve the public URL for a posted image
export const useCurrentUser = createCurrentUserHook(config) // to create an instance of a user

import { nonNull, queryField } from 'nexus';
import { SiteMetadata } from '../types';

export const SiteMetadataQuery = queryField('siteMetadata', {
  type: nonNull(SiteMetadata),
  resolve() {
    return {};
  },
});

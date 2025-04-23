import type { Schema, Struct } from '@strapi/strapi';

export interface ComponentCommonPests extends Struct.ComponentSchema {
  collectionName: 'components_component_common_pests';
  info: {
    displayName: 'commonPests';
    icon: '';
  };
  attributes: {
    description: Schema.Attribute.String;
    pestName: Schema.Attribute.String;
    solution: Schema.Attribute.Blocks;
  };
}

export interface ComponentOptimalTemperature extends Struct.ComponentSchema {
  collectionName: 'components_component_optimal_temperatures';
  info: {
    description: '';
    displayName: 'optimalTemperature';
  };
  attributes: {
    max: Schema.Attribute.Integer;
    min: Schema.Attribute.Integer;
  };
}

export interface ContentContent extends Struct.ComponentSchema {
  collectionName: 'components_content_contents';
  info: {
    displayName: 'content';
  };
  attributes: {};
}

export interface HeadingHeading extends Struct.ComponentSchema {
  collectionName: 'components_heading_headings';
  info: {
    displayName: 'heading';
  };
  attributes: {
    heading: Schema.Attribute.String;
  };
}

export interface ImageImage extends Struct.ComponentSchema {
  collectionName: 'components_image_images';
  info: {
    displayName: 'image';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface ParagraphParagraph extends Struct.ComponentSchema {
  collectionName: 'components_paragraph_paragraphs';
  info: {
    displayName: 'paragraph';
  };
  attributes: {
    paragraph: Schema.Attribute.Blocks;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface TextHeading extends Struct.ComponentSchema {
  collectionName: 'components_text_headings';
  info: {
    displayName: 'heading';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    paragraph: Schema.Attribute.Blocks;
    video: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface VideoVideo extends Struct.ComponentSchema {
  collectionName: 'components_video_videos';
  info: {
    displayName: 'video';
  };
  attributes: {
    video: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'component.common-pests': ComponentCommonPests;
      'component.optimal-temperature': ComponentOptimalTemperature;
      'content.content': ContentContent;
      'heading.heading': HeadingHeading;
      'image.image': ImageImage;
      'paragraph.paragraph': ParagraphParagraph;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'text.heading': TextHeading;
      'video.video': VideoVideo;
    }
  }
}

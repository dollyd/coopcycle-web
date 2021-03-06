<?php

namespace AppBundle\Form;

use AppBundle\Entity\Delivery\PricingRuleSet;
use Doctrine\ORM\EntityRepository;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Validation;
use Symfony\Component\Validator\Constraints;

class EmbedSettingsType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('pricingRuleSet', EntityType::class, array(
                'mapped' => false,
                'required' => false,
                'placeholder' => 'form.store_type.pricing_rule_set.placeholder',
                'label' => 'form.store_type.pricing_rule_set.label',
                'class' => PricingRuleSet::class,
                'choice_label' => 'name',
                'query_builder' => function (EntityRepository $er) {
                    return $er->createQueryBuilder('prs')->orderBy('prs.name', 'ASC');
                }
            ))
            ->add('withVehicle', CheckboxType::class, [
                'label' => 'form.embed_settings.with_vehicle.label',
                'required' => false
            ]);
    }
}

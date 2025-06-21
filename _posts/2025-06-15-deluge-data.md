---
layout: post
title: "The six pillars of thoughtful data generation"
author: Carla Winter, Deborah Plana
date: 2025-06-15
tags: [big data, best practices]
summary_author: Preston Ge
description: "Modern biomedical science has been transformed by large-scale datasets. These approaches are tantalizingly powerful, allowing us to carry out high-throughput measurements and achieving a 'birds-eye' view of a biological system. But if done improperly, they can be corrupted by technical artifacts, confounding variables, model overfitting, and statistical impropriety. In this article, Carla and Deborah draw on their experiences to highlight the promises and pitfalls of big data in biomedical research. They then offer a series of guiding principles for designing and generating these large datasets to not only improve the quality of the science being done, but also inspire more thoughtful experimental design in the future."
topline: "Big data, while potentially transformative, demands principled experimental design"
---

{% include post_summary.html
    author=page.summary_author
    content="Modern biomedical science has been transformed by large-scale datasets. These approaches are tantalizingly powerful, allowing us to carry out high-throughput measurements and achieving a 'birds-eye' view of a biological system. But if done improperly, they can be corrupted by technical artifacts, confounding variables, model overfitting, and statistical impropriety. In this article, Carla and Deborah draw on their experiences to highlight the promises and pitfalls of big data in biomedical research. They then offer a series of guiding principles for designing and generating these large datasets to not only improve the quality of the science being done, but also inspire more thoughtful experimental design in the future."
%}

The modern scientific era is uniquely marked by "big data". Across fields, scientists are generating large-scale datasets designed to be widely applicable to diverse scientific questions. We feel a mix of optimism and skepticism about these efforts. 

Big data atlasing efforts, like the human genome project or cell type atlasing efforts of the mammalian brain, can help establish a roadmap to guide future scientific endeavors. But they can also lead us astray: promoting an emphasis on expense and scale without a concrete goal in mind, leading to a misuse of time and resources, and yielding more noise than signal. 

In this blog post, we explore the debate between data generation and hypothesis-driven research [[1]](#ref1). Drawing from our experiences, we conclude that these approaches are not at odds and are, rather, two sides of the same coin. Given this, together we propose a framework for thoughtful large-scale data generation centered around scientific purpose and utility for hypothesis-driven discovery.

We craft the two following perspectives inspired by each of our respective experiences, but enriched by the collective perspectives of the entire Emergent Properties team.

## Big data, bigger impact

<div class="author-bio">
    <span class="author-bio-dash">—</span>
    <a href="{{ site.baseurl }}/about#carla-winter" class="author-bio-name">Carla Winter</a>
</div>

My scientific interests lie in central nervous system (CNS) injury and repair. My journey in this field started in college where I majored in bioengineering. While I appreciated the goal-directed process of engineering, I felt limited in the progress we could make as a field toward developing a treatment for neural injury without a fundamental understanding of the neural circuits we were  trying to repair. In contrast, I was inspired by two paradigm-shifting hypothesis-driven studies from about a decade prior to the start of my PhD. In these studies, the authors hypothesized that the cell growth control genes expressed in postmitotic mature neurons hinder regeneration potential [[2]](#ref2) [[3]](#ref3). Remarkably, they showed that a single gene knockout of the PTEN tumor suppressor gene enabled robust axonal regrowth after both optic nerve and spinal cord injuries. Despite decades of evidence to the contrary, these studies updated our understanding of neural injury by showing that mammalian CNS neurons did indeed have the potential for regeneration, cracking the door to reveal a world where we could offer treatments to patients affected by spinal cord injuries, stroke, blindness, neurodegenerative disease, and more.

When I took stock of the field's progress, however, I recognized that there had been relatively little progress toward developing clinically relevant treatments for CNS injury and disease. Why? Fundamentally, I believe it is because reductionist hypothesis-driven experiments, like single gene knockout experiments (e.g., the aforementioned PTEN studies), fail to consider the true complexity of biological systems. While they are certainly important for establishing individual phenomena (e.g., intrinsic regenerative capacity of neurons) and causal relationships, a more holistic approach may be required to uncover complex interactions and emergent properties that are not discernable studying one gene or cell type at a time. The current scientific era's ability to generate large-scale datasets offers an avenue for this systems-level approach. In neuroscience, for example, cell type atlasing efforts like the [BRAIN Initiative Cell Atlas Network](https://braininitiative.nih.gov/research/tools-and-technologies-brain-cells-and-circuits/brain-initiative-cell-atlas-network) (BICAN) promise to uncover the cellular diversity that underlies both brain function and dysfunction, with the hope that this understanding will help us to develop more effective treatments after these cells are damaged by injury or disease.

## More data, more problems

<div class="author-bio">
    <span class="author-bio-dash">—</span>
    <a href="{{ site.baseurl }}/about#deborah-plana" class="author-bio-name">Deborah Plana</a>
</div>

It was a running joke in my lab during my PhD that if we wanted our project to be considered for publication in a prominent journal, it was a prerequisite that we perform a single-cell RNA seq experiment, and that the bigger and more expensive the experiment, the higher the likelihood of publication. This only felt like a slight exaggeration, and it was based on a kernel of truth: many prominent publications seemed to emphasize the quantity of data over the quality of its ideas in a paper. 

There are several issues in prioritizing size and technological complexity. One is that it makes science more unequal: the most prominent principal investigators, with the biggest labs and most funding, can most easily perform experiments of the scale necessary for consideration for publication. Once those projects are published, those same kinds of experiments and labs are more likely to be funded, and the cycle continues, with resource-rich labs getting richer and resource-poor labs getting poorer. This makes it harder for important ideas from smaller labs and institutions from entering mainstream conversation. It makes the science published in top journals more homogenous and  harder to challenge.

Another key issue is that resource generation can actually be deleterious to progress if they are not done thoughtfully. For instance, many cell line atlas studies in cancer therapeutic research suffer from bias, such as not properly accounting for growth rate differences across cell lines. Failure to account for cell line growth rates can seriously confound the interpretation of these experiments, limiting our ability to identify biomarker-sensitive subgroups for commonly used drugs (e.g. Paclitaxel [[4]](#ref4)). Other atlases have emphasized measuring metrics of limited clinical utility, such as scoring for preclinical drug synergy, which turns out to have limited relevance to the success of a cancer combination therapy [[5]](#ref5) as compared to minimizing drug toxicity, the latter being a neglected area of research.

## The best of both worlds

This type of "big data" generation is frequently claimed to be at odds with hypothesis-driven research.  Large-scale data generation projects are often depicted as messy fishing expeditions and hypothesis-free, while small-scale projects are clean and hypothesis-driven. This is a false dichotomy: hypothesis-driven science can be both large and small scale. Indeed, some of the most ambitious large-scale data generation efforts were born from thoughtful hypotheses, like the Human Genome Project (HGP) [[6]](#ref6). Though not framed with a classical reductionist hypothesis (e.g., Gene X does function Y), it was founded on the hypothesis that knowing the full sequence of the human genome would (1) enable the rapid identification of disease genes of previously unknown biochemical function, (2) identify new drug targets, and (3) reveal new knowledge about basic physiology and cell biology. The work in the HGP has set up the roadmap for subsequent scientific journeys that are changing patient care, such as the development of gene therapies like Casgevy that are transforming the lives of [patients with sickle cell disease](https://www.technologyreview.com/2023/12/07/1084629/lucky-break-crispr-vertex/). Since the HGP, there have been several other examples of intentional large-scale data generation projects that were designed to test or generate new hypotheses, such as the [BICAN](https://braininitiative.nih.gov/research/tools-and-technologies-brain-cells-and-circuits/brain-initiative-cell-atlas-network), [Genotype-Tissue Expression (GTEx) Project](https://www.gtexportal.org/home/), and [The Cancer Genome Atlas Program (TCGA)](https://www.cancer.gov/ccg/research/genome-sequencing/tcga).

## How to make data generation more thoughtful

With these perspectives in mind, we have come up with some principles that we believe are essential for generating large-scale datasets that serve the broader goal of hypothesis-driven discovery.

<ol>
    <li><span class="highlight-text">Start with a defined question.</span>
        <br>Like any hypothesis-driven project, projects generating large-scale datasets should start with a specific scientific question in mind. This is for two reasons: first, it ensures the dataset to be generated is organized and structured around a concrete goal; second, it allows the researcher to identify the amount of data that is necessary to answer the question (see pillar 2).</li>
    <li><span class="highlight-text">The amount (and type) of data generated should be appropriate for the particular scientific question.</span>
        <br>The scale of data to be generated should reflect how much information is needed to answer the scientific question at hand. For example, if the scientific question is "how does the transcriptome of neuron type X change after disease Y?", but the molecular profile of neuron type X is unknown at baseline, generating an RNA sequencing dataset of neuron type X at both baseline and after disease would be reasonable. If the scientific question is how do the neurons in brain region A change in disease Y, then it may be reasonable to generate a dataset of the single cell transcriptomes of all neuronal types in brain region A, and so on. Sometimes, a simple experimental paradigm can be used to interrogate a complex system, and other times a complex experiment may be required to study a seemingly simple system — the key goal is to best address the question at hand.</li>
    <li><span class="highlight-text">Perform internal validation.</span>
        <br>Reliable scientific resources depend on rigorous internal controls. Technical and biological replicates, appropriate controls, and clear metrics of success should be defined at the outset. As cautioned in the preceding sections, large scale datasets generated without thought or rigor may lead to findings being driven more by noise than signal, leading researchers down rabbit holes and to make misleading conclusions.</li>
    <li><span class="highlight-text">Validate externally, too.</span>
        <br>Orthogonal validation with complementary experimental techniques is essential to safeguarding against overfitting, p-hacking, and false discovery. For example, validating single cell clusters with in situ hybridization provides reassurance against biologically meaningless in silico definitions.</li>
    <li><span class="highlight-text">Provide a synthesis of findings, not just data.</span>
        <br>A dataset is only as useful as the scientific knowledge it leads to. After generating a new large-scale dataset, it is the responsibility of the researchers to interpret the dataset - e.g., using it to refine an existing model, synthesizing it into a new model, or generating a new, testable hypothesis.</li>
    <li><span class="highlight-text">Make the data – and methods – shareable.</span>
        <br>The goal of large-scale data generation should be for the advancement of science. Sharing both the data and methods (including code!) used to generate it ensures these datasets can be explored, tested, and built upon by others.</li>
</ol>

In the current era of "Big Science", we hope that concretely outlining these "rules of thumb" for data generation will not only improve the impact of our science, but also motivate us to be better scientists and thinkers.

## References

<div class="references">
    <div id="ref1">Nurse, P. Biology must generate ideas as well as data. Nature. 2021. doi: 10.1038/d41586-021-02480-z </div>
    <div id="ref2">Park KK, Liu K, Hu Y, Smith PD, Wang C, Cai B, Xu B, Connolly L, Kramvis I, Sahin M, He Z. Promoting axon regeneration in the adult CNS by modulation of the PTEN/mTOR pathway. Science. 2008 Nov 7;322(5903):963-6. doi: 10.1126/science.1161566. PMID: 18988856; PMCID: PMC2652400. </div>
    <div id="ref3">Liu K, Lu Y, Lee JK, Samara R, Willenberg R, Sears-Kraxberger I, Tedeschi A, Park KK, Jin D, Cai B, Xu B, Connolly L, Steward O, Zheng B, He Z. PTEN deletion enhances the regenerative ability of adult corticospinal neurons. Nat Neurosci. 2010 Sep;13(9):1075-81. doi: 10.1038/nn.2603. Epub 2010 Aug 8. PMID: 20694004; PMCID: PMC2928871. </div>
    <div id="ref4">Hafner M, Niepel M, Chung M, Sorger PK. Growth rate inhibition metrics correct for confounders in measuring sensitivity to cancer drugs. Nat Methods. 2016 Jun;13(6):521-7. doi: 10.1038/nmeth.3853. Epub 2016 May 2. PMID: 27135972; PMCID: PMC4887336.</div>
    <div id="ref5">Plana D, Palmer AC, Sorger PK. Independent Drug Action in Combination Therapy: Implications for Precision Oncology. Cancer Discov. 2022 Mar 1;12(3):606-624. doi: 10.1158/2159-8290.CD-21-0212. PMID: 34983746; PMCID: PMC8904281.</div>
    <div id="ref6">International Human Genome Sequencing Consortium. Initial sequencing and analysis of the human genome. Nature. 2001 Feb 15;409(6822):860-921. doi: 10.1038/35057062. PMID: 11237011.</div>
</div>
